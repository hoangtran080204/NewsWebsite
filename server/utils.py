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