import math
import re
from typing import List, Dict, Any, Tuple

class VectorStore:
    """
    In-memory vector store & embedding engine with cosine similarity search.
    Provides dependency-free semantic similarity vectorization for documents and emails.
    """

    @staticmethod
    def _clean_text(text: str) -> List[str]:
        """Tokenize text into lowercase alphanumeric words."""
        return re.findall(r'\w+', text.lower())

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        """
        Generates a fixed-dimensional term-frequency vector embedding for a given text snippet.
        Uses a deterministic hash feature vector map of 128 dimensions normalized to unit length.
        """
        dimensions = 128
        vector = [0.0] * dimensions
        words = cls._clean_text(text)
        
        if not words:
            return vector

        for word in words:
            # Deterministic hash to map word into vector dimension
            idx = sum(ord(char) * (i + 1) for i, char in enumerate(word)) % dimensions
            vector[idx] += 1.0

        # L2 Normalize vector
        magnitude = math.sqrt(sum(val * val for val in vector))
        if magnitude > 0:
            vector = [val / magnitude for val in vector]

        return vector

    @staticmethod
    def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """Calculates cosine similarity between two unit vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        return round(max(0.0, min(1.0, dot_product)), 4)

    @classmethod
    def search_embeddings(
        cls,
        query_text: str,
        chunks: List[Dict[str, Any]],
        top_k: int = 10,
        min_score: float = 0.01
    ) -> List[Tuple[Dict[str, Any], float]]:
        """
        Searches a list of chunks (each containing 'embedding' or 'chunk_text')
        against the query_text, returning top_k matched chunks sorted by relevance score.
        """
        query_vec = cls.get_embedding(query_text)
        scored_results = []

        for chunk in chunks:
            chunk_vec = chunk.get("embedding")
            if isinstance(chunk_vec, str):
                import json
                try:
                    chunk_vec = json.loads(chunk_vec)
                except Exception:
                    chunk_vec = None
            
            if not chunk_vec:
                chunk_text = chunk.get("chunk_text") or chunk.get("text", "")
                chunk_vec = cls.get_embedding(chunk_text)

            score = cls.cosine_similarity(query_vec, chunk_vec)
            
            # Boost score if keyword exact match exists in title/text
            query_words = set(cls._clean_text(query_text))
            text_words = set(cls._clean_text(chunk.get("chunk_text", "") + " " + chunk.get("title", "")))
            if query_words and text_words:
                overlap = len(query_words.intersection(text_words)) / len(query_words)
                score = round(min(1.0, score * 0.5 + overlap * 0.5), 4)

            if score >= min_score:
                scored_results.append((chunk, score))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[1], reverse=True)
        return scored_results[:top_k]
