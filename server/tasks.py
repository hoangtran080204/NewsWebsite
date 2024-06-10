import logging

from flask import Flask
from newsapi import NewsApiClient
from celery import shared_task
from celery.schedules import crontab
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from utils import celery_init_app
from config import ConfigFactory
from models import Base, Article

# Initialize the Flask application
app = Flask(__name__)
app.config.from_object(ConfigFactory.factory())

# Initialize Celery
celery = celery_init_app(app)

# Initialize NewsAPI
newsapi = NewsApiClient(api_key=app.config['NEWS_API_KEY'])

# Initialize logger
logger = logging.getLogger(__name__)

# Initialize SQLAlchemy engine and session
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Base.metadata.create_all(engine)
Session = sessionmaker(autocommit=False, bind=engine)

def get_news_sources(language):
    """
    Helper function to fetch news sources from NewsAPI.

    :param language: The language of the displayed articles by the source(e.g., 'en', 'fr', 'es')
    :return: A comma-separated string of source IDs, or an empty string if no sources found
    """
    try:
        source_ids = []
        all_sources = newsapi.get_sources(
            language=language,
            country='us'
        )
        if all_sources['status'] == 'ok':
            for source in all_sources['sources']:
                source_ids.append(source['id'])
            return ', '.join(source_ids)
        else:
            logger.warning(f"newsapi.get_sources has error: {all_sources}")
            return ''
    except Exception as e:
        logger.exception(f"Exception error: {e}")
        return ''
    
@shared_task(ignore_result=False)
def fetch_latest_news(language, page_size):
    """
    Celery task to update the database with the latest daily news from NewsAPI

    :param language: The language of the news articles (e.g., 'en', 'fr', 'es')
    :param page_size: The number of articles to fetch (default/maximum: 100)
    """

    #Log information when starting celery task
    log_prefix = f"fetch_latest_news language={language}, page_size={page_size}"
    logger.info(f"{log_prefix} - Started")

    session = Session()
    try:
        # Get all available sources from NewsAPI based on specific language
        sources_list = get_news_sources(language)

        # Retrieve the latest articles from the available sources from NewsAPI
        response = newsapi.get_everything(
            sources=sources_list,
            sort_by='publishedAt',
            page_size=page_size,
            page=1,
        )

        if response['status'] != 'ok':
            logger.warning(f"newsapi.get_everything has error: {response}")
            return
        
        searched_articles = response['articles']
        for article in searched_articles:
            article_entry = Article(
                title=article['title'],
                description=article['description'],
                author=article['author'],
                source_name= article['source']['name'],
                url=article['url'],
                image_url =article['urlToImage']
            )
            session.add(article_entry)
        session.commit()

    except Exception as e:
        logger.exception(f"Exception error: {e}")
        session.rollback()

    finally:
        session.close()


# Configure celery beat to schedule periodic task
celery.conf.beat_schedule = {
    'fetch-100-latest-english-news-daily': {
        'task': 'tasks.fetch_latest_news',
        'schedule': crontab(minute=0, hour=0),  # Run task at midnight every day
        'kwargs': {'language': 'en', 'page_size': 100}
    },
}

if __name__ == '__main__':
    app.run()