import logging
from flask import Flask, request, jsonify
from newsapi import NewsApiClient
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker

from config import ConfigFactory
from models import Article
from utils import article_to_dict
# Init Flask App with configuratioin
app = Flask(__name__)
app.config.from_object(ConfigFactory.factory())


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
        return jsonify(articles_list)
    
    except Exception as e:
        logger.exception(f"Database errors: {e}")
        return jsonify([])
    
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
            searched_articles = response['articles']
            return jsonify(searched_articles)
        else:
            # Logging specific error from NewsAPI in case of failure
            logger.warning(f"newsapi.get_everything has error: {response}")
            return jsonify({"error": "API Request Failed."}), 500

    except Exception as e:
        # Handle any exceptions that are not explicitly raised by NewsAPI
        logger.exception(
            f"Exception errors when calling newsapi.get_everything: {e}")
        return jsonify({"error": "API Request Failed."}), 500
    
@app.route("/search", methods=["GET"])
def search():
    """
    API endpoint for handling search request based on user input
    
    """
    if request.method == "GET":
        searched_term = request.args.get("q")
        db_result = get_articles_from_database(searched_term)
        
        # Return database query if not empty, else return API call
        if db_result.get_json():
            return db_result
        else:
            logger.info("No matching articles from database query")
            return get_articles_from_newsapi(searched_term)




if __name__ == "__main__":
    app.run()
