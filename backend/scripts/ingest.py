"""Validate licensed Markdown files and report their retrieval chunk count.

Production ingestion should replace the in-memory index with Supabase pgvector:
embed each chunk with OPENAI_EMBEDDING_MODEL and upsert its vector plus metadata.
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parents[1]))

from app.retrieval import load_chunks


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("directory", type=Path, nargs="?", default=Path("knowledge_base"))
    args = parser.parse_args()
    chunks = load_chunks(args.directory)
    print(f"Validated {len(chunks)} chunks from {args.directory}")


if __name__ == "__main__":
    main()
