import json
import time
from collections import defaultdict, deque
from pathlib import Path
from typing import Annotated
from uuid import uuid4

from fastapi import FastAPI, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from .config import settings
from .models import UserProfile
from .providers import describe_image, stream_answer, transcribe_audio
from .retrieval import load_chunks, retrieve
from .safety import safety_message

app = FastAPI(title="FitCoach RAG API", version="0.1.0")
chunks = load_chunks(Path(__file__).parent.parent / "knowledge_base")
requests_by_user: dict[str, deque[float]] = defaultdict(deque)
history: dict[str, list[dict[str, str]]] = defaultdict(list)


def check_rate_limit(user_id: str) -> None:
    now = time.time()
    requests = requests_by_user[user_id]
    while requests and requests[0] < now - 60:
        requests.popleft()
    if len(requests) >= settings.chat_rate_limit_per_minute:
        raise HTTPException(status_code=429, detail="Chat rate limit exceeded. Try again shortly.")
    requests.append(now)


def profile_from_json(value: str | None) -> UserProfile:
    if not value:
        return UserProfile()
    try:
        return UserProfile.model_validate_json(value)
    except ValueError as error:
        raise HTTPException(status_code=422, detail="Invalid profile JSON.") from error


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "chunks": str(len(chunks))}


@app.post("/api/chat")
async def chat(
    text: Annotated[str, Form()] = "",
    conversation_id: Annotated[str | None, Form()] = None,
    profile: Annotated[str | None, Form()] = None,
    language: Annotated[str, Form()] = "en",
    image: Annotated[UploadFile | None, File()] = None,
    x_user_id: Annotated[str | None, Header()] = None,
):
    user_id = x_user_id or "prototype-user"
    check_rate_limit(user_id)
    if not text.strip() and image is None:
        raise HTTPException(status_code=422, detail="Send text, an image, or both.")
    if image and (image.content_type or "") not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported.")
    if image:
        image_bytes = await image.read()
        if len(image_bytes) > 8 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Image must be 8 MB or smaller.")
    else:
        image_bytes = None
    user_profile = profile_from_json(profile)
    safe = safety_message(text)
    if safe:
        return StreamingResponse(iter([json.dumps({"type": "done", "answer": safe, "sources": [], "suggestions": []}) + "\n"]), media_type="application/x-ndjson")
    image_description = await describe_image(image_bytes, image.content_type or "image/jpeg") if image_bytes else ""
    query = f"{text}\n{image_description}\nGoal: {user_profile.goal or 'unknown'}"
    selected = retrieve(chunks, query, user_profile.goal)
    context = "\n\n".join(f"[{item.title}] {item.text}" for item in selected)
    conversation_id = conversation_id or str(uuid4())
    prior = history[conversation_id][-10:]
    language_name = {"en": "English", "hi": "Hindi", "mr": "Marathi"}.get(language, "English")
    prompt = f"Respond in {language_name}. CONTEXT:\n{context}\n\nUSER PROFILE:\n{user_profile.model_dump_json()}\n\nRECENT CONVERSATION:\n{json.dumps(prior)}\n\nIMAGE DESCRIPTION:\n{image_description or 'none'}\n\nUSER QUESTION:\n{text}"
    sources = [{"title": item.title, "source": item.source, "topic": item.topic} for item in selected]

    async def events():
        answer = []
        try:
            async for token in stream_answer(prompt):
                answer.append(token)
                yield json.dumps({"type": "token", "text": token}) + "\n"
        except RuntimeError as error:
            yield json.dumps({"type": "error", "message": str(error)}) + "\n"
            return
        final = "".join(answer)
        history[conversation_id].extend([{"role": "user", "content": text}, {"role": "assistant", "content": final}])
        yield json.dumps({"type": "done", "conversationId": conversation_id, "answer": final, "sources": sources, "suggestions": ["Make a meal plan", "Fix my form", "Weekly workout"]}) + "\n"

    return StreamingResponse(events(), media_type="application/x-ndjson")


@app.post("/api/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    language: Annotated[str, Form()] = "en",
):
    if language not in {"en", "hi", "mr"}:
        raise HTTPException(status_code=422, detail="Unsupported language.")
    if (audio.content_type or "") not in {"audio/m4a", "audio/mp4", "audio/webm", "audio/wav", "audio/x-caf"}:
        raise HTTPException(status_code=415, detail="Unsupported audio format.")
    data = await audio.read()
    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Audio must be 25 MB or smaller.")
    try:
        text = await transcribe_audio(data, audio.filename or "voice.m4a", audio.content_type or "audio/m4a", language)
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"text": text}


@app.get("/api/chat/history")
async def chat_history(conversation_id: str):
    return {"conversationId": conversation_id, "messages": history[conversation_id][-20:]}


@app.post("/api/admin/ingest")
async def ingest_document(
    document: UploadFile = File(...),
    x_admin_key: Annotated[str | None, Header()] = None,
):
    if not settings.admin_ingest_key or x_admin_key != settings.admin_ingest_key:
        raise HTTPException(status_code=403, detail="Admin ingestion is not authorized.")
    if document.filename is None or not document.filename.endswith(".md"):
        raise HTTPException(status_code=415, detail="Only licensed Markdown documents are supported.")
    destination = Path(__file__).parent.parent / "knowledge_base" / Path(document.filename).name
    destination.write_bytes(await document.read())
    chunks.clear()
    chunks.extend(load_chunks(destination.parent))
    return {"status": "ingested", "filename": destination.name, "chunks": len(chunks)}
