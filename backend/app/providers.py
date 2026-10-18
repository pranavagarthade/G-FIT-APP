import base64
from collections.abc import AsyncIterator

from openai import AsyncOpenAI, OpenAIError

from .config import settings

SYSTEM_PROMPT = """You are FitCoach, an evidence-based fitness assistant. Answer the user's question using only relevant CONTEXT and USER PROFILE. Be concise: answer first, then at most 2 brief bullets. For food photos give estimated calories/macros. For exercise photos give safe corrections. Do not diagnose or recommend unsafe extremes; refer medical concerns to a professional. If the image is unclear, ask for a clearer one."""

FOOD_IMAGE_SYSTEM_PROMPT = """Analyze the food image and respond only in this format:
🍽️ Food Detected: <list every visible food item and drink>
📏 Estimated Portion: <size per item>

🔥 Calories:
- <item>: <estimated range> kcal
- Total: <estimated range> kcal

💪 Macros (approx.): Protein <number or range> g | Carbs <number or range> g | Fat <number or range> g

✅/⚠️/❌ Verdict: <Healthy, Moderately Healthy, or Unhealthy>
Reason: <1-2 sentences considering sugar, saturated fat, sodium, fiber, processing level, and portion size>

💡 Tip: <one simple healthier swap or suggestion>

These are approximate values, not medical advice.

Identify every visible food and drink, estimate portions, calories, and total calories. Use ranges when uncertain and state assumptions briefly. If blurry or no food, respond exactly: "I couldn't detect any food. Please upload a clearer photo." Keep it short and do not add anything outside this format."""


def client() -> AsyncOpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is required for generated responses.")
    return AsyncOpenAI(api_key=settings.openai_api_key)


async def describe_image(image: bytes, content_type: str) -> str:
    response = await client().chat.completions.create(
        model=settings.openai_vision_model,
        temperature=0,
        max_tokens=160,
        messages=[{"role": "user", "content": [
            {"type": "text", "text": "Describe this image for fitness retrieval. For food images, identify every visible food item and drink and note likely ingredients, portion clues, and uncertainty. Return a short JSON object with type, items, exercise, visible_form, and uncertainty. Do not infer identity, medical conditions, or body composition."},
            {"type": "image_url", "image_url": {"url": f"data:{content_type};base64,{base64.b64encode(image).decode()}"}},
        ]}],
    )
    return response.choices[0].message.content or "{}"


async def stream_answer(
    prompt: str,
    system_prompt: str = SYSTEM_PROMPT,
    max_tokens: int = 160,
) -> AsyncIterator[str]:
    response = await client().chat.completions.create(
        model=settings.openai_chat_model,
        temperature=0.2,
        stream=True,
        max_tokens=max_tokens,
        messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": prompt}],
    )
    async for event in response:
        token = event.choices[0].delta.content if event.choices else None
        if token:
            yield token


async def transcribe_audio(audio: bytes, filename: str, content_type: str, language: str) -> str:
    response = await client().audio.transcriptions.create(
        model=settings.openai_transcription_model,
        file=(filename, audio, content_type),
        language=language,
        response_format="text",
    )
    return str(response).strip()
