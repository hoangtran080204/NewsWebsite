import pytest
from flask import Flask
from flask_jwt_extended import JWTManager
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server import app as flask_app, Session
from models import Base, User, Article
from werkzeug.security import generate_password_hash

@pytest.fixture(scope="session")
def app():
    flask_app.config['TESTING'] = True
    flask_app.config['JWT_SECRET_KEY'] = 'test_secret_key'
    JWTManager(flask_app)
    return flask_app

@pytest.fixture(scope="session")
def client(app):
    return app.test_client()

@pytest.fixture(scope="session")
def pg_engine(postgresql):
    """Create a PostgreSQL engine for tests."""
    return create_engine(postgresql.url())

@pytest.fixture(scope="session")
def tables(pg_engine):
    Base.metadata.create_all(pg_engine)
    yield
    Base.metadata.drop_all(pg_engine)

@pytest.fixture(scope="function")
def dbsession(pg_engine, tables):
    """Returns an sqlalchemy session, and after the test tears down everything properly."""
    connection = pg_engine.connect()
    transaction = connection.begin()
    session = sessionmaker(bind=connection)()
    yield session
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def mock_db_session(mocker):
    mock_session = mocker.Mock(spec=Session)
    mocker.patch('server.Session', return_value=mock_session)
    return mock_session

@pytest.fixture
def mock_newsapi(mocker):
    return mocker.patch('server.newsapi')

@pytest.fixture
def test_user(dbsession):
    user = User(username="testuser", password=generate_password_hash("testpass"))
    dbsession.add(user)
    dbsession.commit()
    return user

@pytest.fixture
def test_article(dbsession):
    article = Article(
        title="Test Article",
        description="This is a test article",
        url="http://test.com/article"
    )
    dbsession.add(article)
    dbsession.commit()
    return article