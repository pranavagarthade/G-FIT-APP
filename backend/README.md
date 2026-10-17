# FitCoach RAG backend

## Architecture

`multipart mobile request -> FastAPI validation/rate limit -> optional vision description -> retrieval -> grounded OpenAI stream -> NDJSON mobile renderer`

The current vertical slice uses a deterministic in-memory retriever so it can be tested without credentials. The `Chunk` interface is ready for a Supabase `pgvector` adapter: store an embedding and the existing metadata (`topic`, `source`, `difficulty`, `goal`) for every chunk. Do not ingest documents without a license.

## Run locally

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn app.main:app --reload --port 8000
```

Set `EXPO_PUBLIC_API_URL=http://YOUR-LAN-IP:8000` for a physical device; `localhost` only works for a simulator on the same host.

`OPENAI_API_KEY` is required for generated, vision, and voice transcription responses. `OPENAI_TRANSCRIPTION_MODEL` defaults to `gpt-4o-mini-transcribe`. `ADMIN_INGEST_KEY` must be set before using `/api/admin/ingest`. Prototype requests use `prototype-user`; replace this with the existing auth adapter when profile/auth details are available.

## API

- `POST /api/chat`: multipart fields `text`, `image`, `conversation_id`, and optional profile JSON. Streams NDJSON token/done/error events.
- `POST /api/transcribe`: multipart `audio` plus `language` (`en`, `hi`, or `mr`); returns transcribed text.
- `GET /api/chat/history?conversation_id=...`: returns the last 20 messages.
- `POST /api/admin/ingest`: admin-key protected licensed Markdown upload.
- `GET /health`: service and chunk count.

Images are resized on-device and not persisted by this slice. A production storage adapter must require consent, encrypt at rest, and delete/anonymize after 30 days.

The mobile chat supports English, Hindi, and Marathi. The microphone uses browser speech recognition on web and Expo Audio recording plus `/api/transcribe` on native devices. Assistant responses are spoken with Expo Speech.

## Evaluation checklist

- Grounding: every answer cites retrieved documents; insufficient context is acknowledged.
- Safety: medical diagnosis, extreme dieting, self-harm, eating-disorder, and minor-safety prompts are handled without fitness instructions.
- Vision: food outputs say estimate and confidence; form outputs describe only visible issues; progress photos receive non-judgmental observations.
- Privacy: no image/profile logging; authenticated user IDs and encrypted storage in production.
- Performance: measure request-to-first-token and target under 5 seconds on a warm service.
- Quality: manually score 10 conversations for citation correctness, personalization, and hallucination rate.
