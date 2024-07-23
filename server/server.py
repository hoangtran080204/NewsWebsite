import logging
from flask import Flask, request, jsonify
from newsapi import NewsApiClient
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS
from config import ConfigFactory
from models import Article, User
from utils import article_to_dict, format_response
# Init Flask App with configuration
app = Flask(__name__)
app.config.from_object(ConfigFactory.factory())
CORS(app)

# Init JWTManager 
jwt = JWTManager(app)

# Init News Api
newsapi = NewsApiClient(api_key=app.config['NEWS_API_KEY'])

# Init logger
logger = logging.getLogger(__name__)

# Initialize SQLAlchemy engine and session
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Session = sessionmaker(autocommit=False, bind=engine)


def get_articles_from_database(searched_term):
    """
    Get articles from database whose title or description contains the given searched_term.

    :param searched_term: User input
    :return: JSON representation of matching Article objects in similar format to NewsAPI response
    """
    session = Session()  
    try:
        # Wrap the searched_term with '%' for ilike pattern matching
        searched_term = f'%{searched_term}%'
        
        # Construct the query using ilike and or_ operator
        results = session.query(Article).filter(
            or_(
                Article.title.ilike(searched_term),
                Article.description.ilike(searched_term)
            )
        ).all()
        
        #Convert each article to match the format from NewsAPI response
        articles_list = []
        for article in results:
            articles_list.append(article_to_dict(article))
        db_response = format_response("ok", len(articles_list), articles_list)
        return jsonify(db_response)
    
    except Exception as e:
        logger.exception(f"Database errors: {e}")
        return jsonify({"status": "error", "message": "Database Query Failed."})
    
    finally:
        # Ensure the session is closed properly
        session.close()

def get_articles_from_newsapi(searched_term):
    """
    Get matching articles using NewsAPI endpoint.

    :param searched_term: User input
    :return: JSON representation of articles retrieved from NewsAPI
    """
    try:
        response = newsapi.get_everything(
            q=searched_term,
            language="en",
            sort_by="relevancy",
            page=1,
        )
        if response['status'] == 'ok':
            api_response = format_response(response['status'], response['totalResults'], response['articles'])
            return jsonify(api_response)
        else:
            # Logging specific error from NewsAPI in case of failure
            logger.warning(f"newsapi.get_everything has error: {response}")
            return jsonify({"status": "error", "message": "API Request Failed."}), 500

    except Exception as e:
        # Handle any exceptions that are not explicitly raised by NewsAPI
        logger.exception(
            f"Exception errors when calling newsapi.get_everything: {e}")
        return jsonify({"status": "error", "message": "API Request Failed."}), 500
    

@app.route("/search", methods=["GET"])
@jwt_required()
def search():
    """
    API endpoint for handling search request based on user input
    
    """
    # Get the identity of the current user
    current_user = get_jwt_identity() 
    logger.info(f"Search request from user: {current_user}")

    if request.method == "GET":
        searched_term = request.args.get("q")
        db_result = get_articles_from_database(searched_term)
        
        # Extract JSON data from db_result
        db_json = db_result.json
        
        # Return database query if not empty, else return API call
        if db_json['status'] == 'ok' and db_json['article_count'] > 0:
            return db_result
        else:
            logger.info("No matching articles from database query")
            return get_articles_from_newsapi(searched_term)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"status": "error", "message": "Both username and password are required."}), 400

    session = Session()
    existing_user = session.query(User).filter_by(username=username).first()
    
    if existing_user:
        session.close()
        return jsonify({"status": "error", "message": "Sorry, this username already exists."}), 500

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password=hashed_password)
    session.add(new_user)
    session.commit()
    session.close()

    # Create and return access and refresh token
    access_token = create_access_token(identity=username)
    refresh_token = create_refresh_token(identity=username)
    return jsonify({"status": "ok", "message": "Account created successfully", "access_token": access_token, "refresh_token": refresh_token}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    session = Session()
    user = session.query(User).filter_by(username=username).first()
    session.close()

    if user and check_password_hash(user.password, password):
        access_token = create_access_token(identity=username)
        refresh_token = create_refresh_token(identity=username)
        return jsonify({"status": "ok", "message": "Login successful", "access_token": access_token, "refresh_token":refresh_token}), 200
    else:
        return jsonify({"status": "error", "message": "Invalid username or password"}), 401
    
@app.route('/refresh-token', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    API endpoint to refresh the access token using a valid refresh token.

    :return: JSON response with the new access token
    """
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    
    return jsonify({"status" : "ok", "access_token" : access_token}), 201

if __name__ == "__main__":
    app.run()
    