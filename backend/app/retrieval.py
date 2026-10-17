import re
from dataclasses import dataclass
from pathlib import Path

import numpy as np

STOP_WORDS = frozenset({"a", "an", "and", "are", "for", "how", "i", "is", "my", "of", "should", "the", "to", "what"})


@dataclass(frozen=True)
class Chunk:
    text: str
    title: str
    source: str
    topic: str
    goal: str
    tokens: frozenset[str]


def _tokens(value: str) -> frozenset[str]:
    return frozenset(
        token for token in re.findall(r"[a-z0-9]+", value.lower())
        if token not in STOP_WORDS
    )


def load_chunks(directory: Path) -> list[Chunk]:
    chunks: list[Chunk] = []
    for path in sorted(directory.glob("*.md")):
        raw = path.read_text(encoding="utf-8")
        metadata, _, body = raw.partition("\n---\n")
        fields = {
            key.strip(): value.strip()
            for line in metadata.splitlines()
            if ":" in line
            for key, value in [line.split(":", 1)]
        }
        paragraphs = [part.strip() for part in body.split("\n\n") if part.strip()]
        for paragraph in paragraphs:
            chunks.append(
                Chunk(
                    text=paragraph,
                    title=fields.get("title", path.stem),
                    source=fields.get("source", "Licensed sample content"),
                    topic=fields.get("topic", "general"),
                    goal=fields.get("goal", "all"),
                    tokens=_tokens(f"{fields.get('title', '')} {fields.get('topic', '')} {paragraph}"),
                )
            )
    return chunks


def retrieve(chunks: list[Chunk], query: str, goal: str | None, top_k: int = 5) -> list[Chunk]:
    query_tokens = _tokens(query)
    scored: list[tuple[float, Chunk]] = []
    for chunk in chunks:
        overlap = len(query_tokens & chunk.tokens)
        goal_bonus = 2 if goal and (chunk.goal == goal or chunk.goal == "all") else 0
        scored.append((overlap + goal_bonus, chunk))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [chunk for score, chunk in scored[:top_k] if score > 0] or [item[1] for item in scored[:top_k]]


def cosine_similarity(query: list[float], vectors: list[list[float]]) -> np.ndarray:
    q = np.asarray(query)
    matrix = np.asarray(vectors)
    return (matrix @ q) / (np.linalg.norm(matrix, axis=1) * np.linalg.norm(q))
