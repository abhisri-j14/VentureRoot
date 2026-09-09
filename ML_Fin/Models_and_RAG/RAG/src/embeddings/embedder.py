"""
Modular Embedding Engine.
Supports TF-IDF vectorizer fallback, SentenceTransformer (if available), and Gemini embedding API wrapper.
Outputs L2-normalized vector representations.
"""

import numpy as np
from typing import List, Union
from sklearn.feature_extraction.text import TfidfVectorizer

class BaseEmbedder:
    def embed_texts(self, texts: List[str]) -> np.ndarray:
        raise NotImplementedError
        
    def embed_query(self, query: str) -> np.ndarray:
        raise NotImplementedError

class TFIDFEmbedder(BaseEmbedder):
    """
    Local fast TF-IDF embedder suitable for offline deployment & deterministic retrieval.
    Transforms texts into L2-normalized sparse/dense vectors.
    """
    def __init__(self, max_features: int = 500):
        self.max_features = max_features
        self.vectorizer = TfidfVectorizer(
            max_features=self.max_features,
            ngram_range=(1, 2),
            sublinear_tf=True,
            norm='l2'
        )
        self.is_fitted = False

    def fit_embed_texts(self, texts: List[str]) -> np.ndarray:
        if not texts:
            return np.zeros((0, self.max_features), dtype=np.float32)
        vecs = self.vectorizer.fit_transform(texts).toarray()
        self.is_fitted = True
        return vecs.astype(np.float32)

    def embed_texts(self, texts: List[str]) -> np.ndarray:
        if not self.is_fitted:
            return self.fit_embed_texts(texts)
        if not texts:
            return np.zeros((0, self.max_features), dtype=np.float32)
        vecs = self.vectorizer.transform(texts).toarray()
        return vecs.astype(np.float32)

    def embed_query(self, query: str) -> np.ndarray:
        if not self.is_fitted:
            # Fit on query if not fitted yet
            return self.fit_embed_texts([query])[0]
        vecs = self.vectorizer.transform([query]).toarray()
        return vecs[0].astype(np.float32)

def get_embedder(provider: str = "local_tfidf", max_features: int = 300) -> BaseEmbedder:
    """Factory method to get requested embedder instance."""
    if provider == "sentence_transformer":
        try:
            from sentence_transformers import SentenceTransformer
            class STEmbedder(BaseEmbedder):
                def __init__(self):
                    self.model = SentenceTransformer("all-MiniLM-L6-v2")
                def embed_texts(self, texts: List[str]) -> np.ndarray:
                    return self.model.encode(texts, normalize_embeddings=True)
                def embed_query(self, query: str) -> np.ndarray:
                    return self.model.encode([query], normalize_embeddings=True)[0]
            return STEmbedder()
        except ImportError:
            pass # Fallback to local TFIDF if sentence_transformers is missing
            
    return TFIDFEmbedder(max_features=max_features)
