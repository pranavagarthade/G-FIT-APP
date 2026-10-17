import re


SELF_HARM = re.compile(r"\b(suicide|self[- ]harm|kill myself|end my life)\b", re.I)
EATING_DISORDER = re.compile(r"\b(purge|bulimia|anorexia|starve myself|binge)\b", re.I)
MINOR_RISK = re.compile(r"\b(child|minor|underage)\b", re.I)


def safety_message(text: str) -> str | None:
    if SELF_HARM.search(text):
        return "I’m sorry you’re dealing with this. Please contact local emergency services or a crisis hotline now, and reach out to someone you trust. I can’t provide fitness guidance for an immediate safety crisis."
    if EATING_DISORDER.search(text):
        return "I can’t help with restrictive or compensatory eating behaviors. Please contact a qualified clinician or eating-disorder service; a registered dietitian can support your goals safely."
    if MINOR_RISK.search(text):
        return "For anyone under 18, fitness and nutrition changes should be discussed with a parent/guardian and a qualified healthcare professional."
    return None
