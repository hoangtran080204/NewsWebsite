import pytest
from flask import json
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Article

def test_signup_success(client, dbsession):
    response = client.post('/signup', json={
        'username': 'newuser',
        'password': 'newpassword'
    })
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert data['message'] == 'Account created successfully'
    assert 'access_token' in data
    assert 'refresh_token' in data

    # Check if user was actually created in the database
    user = dbsession.query(User).filter_by(username='newuser').first()
    assert user is not None
    assert check_password_hash(user.password, 'newpassword')

def test_signup_existing_user(client, test_user):
    response = client.post('/signup', json={
        'username': test_user.username,
        'password': 'somepassword'
    })
    assert response.status_code == 500
    data = json.loads(response.data)
    assert data['status'] == 'error'
    assert data['message'] == 'Sorry, this username already exists.'

def test_login_success(client, test_user):
    response = client.post('/login', json={
        'username': test_user.username,
        'password': 'testpass'
    })
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert data['message'] == 'Login successful'
    assert 'access_token' in data
    assert 'refresh_token' in data

def test_login_failure_wrong_password(client, test_user):
    response = client.post('/login', json={
        'username': test_user.username,
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['status'] == 'error'
    assert data['message'] == 'Invalid username or password'

def test_login_failure_nonexistent_user(client):
    response = client.post('/login', json={
        'username': 'nonexistentuser',
        'password': 'testpass'
    })
    assert response.status_code == 401
    data = json.loads(response.data)
    assert data['status'] == 'error'
    assert data['message'] == 'Invalid username or password'

def test_search_with_db_results(client, dbsession, test_article):
    # Add a token to headers
    access_token = client.post('/login', json={
        'username': 'testuser',
        'password': 'testpass'
    }).json['access_token']

    response = client.get('/search?q=Test', headers={'Authorization': f'Bearer {access_token}'})
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert len(data['articles']) == 1
    assert data['articles'][0]['title'] == 'Test Article'
    assert data['articles'][0]['url'] == 'http://test.com/article'

def test_search_with_newsapi_result(client, mock_db_session, mock_newsapi):

    # Add a token to headers
    access_token = client.post('/login', json={
        'username': 'testuser',
        'password': 'testpass'
    }).json['access_token']

    mock_db_session.query.return_value.filter.return_value.all.return_value = []
    mock_newsapi.get_everything.return_value = {
        'status': 'ok',
        'totalResults': 1,
        'articles': [{'title': 'API Article', 'description': 'API Description', 'url': 'http://newsapi.com/test'}]
    }

    response = client.get('/search?q=nonexistent', headers={'Authorization': f'Bearer {access_token}'})
    data = json.loads(response.data)

    assert response.status_code == 200
    assert data['status'] == 'ok'
    assert len(data['articles']) == 1
    assert data['articles'][0]['title'] == "API Article"
    assert data['articles'][0]['description'] == "API Description"
    assert data['articles'][0]['url'] == "http://newsapi.com/test"

def test_refresh_token(client, test_user):
    # First, login to get a refresh token
    login_response = client.post('/login', json={
        'username': 'testuser',
        'password': 'testpass'
    })
    refresh_token = login_response.json['refresh_token']

    # Now use the refresh token to get a new access token
    response = client.post('/refresh-token', headers={'Authorization': f'Bearer {refresh_token}'})
    assert response.status_code == 201
    data = json.loads(response.data)
    assert data['status'] == 'ok'
    assert 'access_token' in data

def test_refresh_token_invalid(client):
    response = client.post('/refresh-token', headers={'Authorization': 'Bearer invalid_token'})
    assert response.status_code == 401

