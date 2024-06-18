from celery import Celery, Task
from flask import Flask

def celery_init_app(app: Flask) -> Celery:
    """
    Function to initialize Celery with the provided Flask application.
    """
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app

def article_to_dict(article):
    """
    Convert an Article object to a matching format similar to the response object from NewsAPI.

    :param article: Article object
    :return: Dictionary representation of the article object
    """
    return {
        "source": {
            "name": article.source_name
        },
        "author": article.author,
        "title": article.title,
        "description": article.description,
        "url": article.url,
        "urlToImage": article.image_url
    }

def format_response(status, article_count, article_list):
    """
    Format a base structure for API response

    :param status: status message
    :param article_count: total count of returned articles
    :param article_list: list of returned articles
    :return: Dictionary format for API response
    """

    #Default page size from newsapi
    page_size = 100
    #Default current_page from newsapi for developer plan
    current_page = 1

    total_pages = (article_count + page_size - 1) // page_size
    has_next_page = current_page < total_pages

    response = {
            "status" : status,
            "article_count" : article_count,
            "article_list" : article_list,
            "pagination": {
                "current_page" : current_page,
                "total_pages" : total_pages,
                "has_next_page" : has_next_page
            }
    }

    return response