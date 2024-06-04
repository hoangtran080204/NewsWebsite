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


@shared_task(ignore_result=False)
def fetch_latest_news():
    """
    Celery task to update the database with the latest news from NewsAPI
    """
    session = Session()
    try:
        # Get all available sources from NewsAPI
        source_ids = []
        all_sources = newsapi.get_sources(
            language='en',
            country='us'
        )
        for source in all_sources['sources']:
            source_ids.append(source['id'])
        sources_list = ', '.join(source_ids)

        # Retrieve the latest articles from the available sources from NewsAPI
        response = newsapi.get_everything(
            sources=sources_list,
            language='en',
            sort_by='publishedAt',
            page=1,
        )
        if response['status'] == 'ok':
            searched_articles = response['articles']
            for article in searched_articles:
                article_entry = Article(
                    title=article['title'],
                    description=article['description'],
                    author=article['author'],
                    url=article['url'],
                    urlToImage=article['urlToImage']
                )
                session.add(article_entry)
            session.commit()
        else:
            # Logging specific error from NewsAPI in case of failure
            logger.warning(f"newsapi.get_everything has error: {response}")

    except Exception as e:
        logger.exception(f"Exception error: {e}")
        session.rollback()

    finally:
        session.close()


# Configure celery beat to schedule periodic task
celery.conf.beat_schedule = {
    'fetch-latest-news-daily': {
        'task': 'tasks.fetch_latest_news',
        'schedule': crontab(minute=0, hour=0),  # Run task at midnight every day
    },
}

if __name__ == '__main__':
    app.run()