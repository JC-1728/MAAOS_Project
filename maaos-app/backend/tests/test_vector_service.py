import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.session import Base
from app.models.user import User
from app.models.email import Email
from app.services.vector_store import VectorStore
from app.services.vector_service import VectorService

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

def test_vector_store_cosine_similarity():
    vec1 = VectorStore.get_embedding("Midterm exam scheduled for next Tuesday")
    vec2 = VectorStore.get_embedding("Midterm examination date announcement")
    vec3 = VectorStore.get_embedding("Banana smoothie recipe")

    score_similar = VectorStore.cosine_similarity(vec1, vec2)
    score_unrelated = VectorStore.cosine_similarity(vec1, vec3)

    assert score_similar > score_unrelated
    assert score_similar > 0.1

def test_email_vectorization_and_search(db_session):
    user = User(id="test-vector-user", name="Ann Maria", email="ann@univ.edu")
    db_session.add(user)
    db_session.commit()

    email1 = Email(
        user_id=user.id,
        google_message_id="msg-v1",
        subject="[CS401] Midterm Schedule Update",
        sender="prof.smith@univ.edu",
        body_snippet="The CS401 midterm examination is confirmed for next Tuesday at 10 AM in Hall B."
    )
    email2 = Email(
        user_id=user.id,
        google_message_id="msg-v2",
        subject="Library Book Return Notice",
        sender="library@univ.edu",
        body_snippet="Your borrowed textbook is due tomorrow."
    )
    db_session.add_all([email1, email2])
    db_session.commit()

    # Vectorize emails
    chunk1 = VectorService.vectorize_email(email1, db_session)
    chunk2 = VectorService.vectorize_email(email2, db_session)

    assert chunk1 is not None
    assert chunk1.embedding is not None

    # Perform semantic vector search
    results = VectorService.search_user_content(
        query="midterm examination",
        user_id=user.id,
        db=db_session,
        limit=5
    )

    assert len(results) > 0
    assert "Midterm" in results[0]["title"] or "Midterm" in results[0]["snippet"]
    assert results[0]["relevance_score"] > 0.0
