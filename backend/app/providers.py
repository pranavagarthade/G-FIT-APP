import base64
import json
from collections.abc import AsyncIterator

from openai import AsyncOpenAI

from .config import settings

SYSTEM_PROMPT = """You are FitCoach, a friendly, evidence-based fitness assistant inside a mobile app. Use the provided CONTEXT and USER PROFILE to answer. Be concise, practical and motivating. For food photos give estimated calories/macros with a clear 'estimate' label and a confidence level. For form photos give specific, safe corrections. Never diagnose injuries or medical conditions, never recommend extreme diets or unsafe training, and advise seeing a doctor or certified trainer for pain, medical conditions, pregnancy, or eating disorder signs. If the image is unclear or unrelated to fitness, ask for a better one. Format: short answer, then 3 bullet suggestions, then one follow-up question."""


def client() -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required for generated responses.")
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def describe_image(image: bytes, content_type: str) -> str:
    response = await client().chat.completions.create(
        model=settings.openai_vision_model,
        temperature=0,
        max_tokens=250,
        messages=[{"role": "user", "content": [
            {"type": "text", "text": "Describe this image for fitness retrieval. Return a short JSON object with type, items, exercise, visible_form, and uncertainty. Do not infer identity, medical conditions, or body composition."},
            {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{base64.b64encode(image).decode()}"}},
        ]}],
    )
    return response.choices[0].message.content or "{}"


async def stream_answer(prompt: str) -> AsyncIterator[str]:
    response = await client().chat.completions.create(
        model=settings.openai_chat_model,
        temperature=0.2,
        stream=True,
        messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}],
    )
    async for event in response:
        token = event.choices[0].delta.content if event.choices else None
        if token:
            yield token
