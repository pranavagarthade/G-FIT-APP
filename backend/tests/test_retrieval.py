from pathlib import Path

from app.retrieval import load_chunks, retrieve


def test_retrieval_prioritizes_matching_topic():
    chunks = load_chunks(Path(__file__).parents[1] / "knowledge_base")
    results = retrieve(chunks, "how should I squat safely", None)
    assert results
    assert results[0].title == "Squat form"


def test_retrieval_respects_goal_bonus():
    chunks = load_chunks(Path(__file__).parents[1] / "knowledge_base")
    results = retrieve(chunks, "protein and training", "muscle_gain")
    assert any(result.title == "Protein and resistance training" for result in results)
