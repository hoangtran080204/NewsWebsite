from os import environ, path
from dotenv import load_dotenv, find_dotenv
from datetime import timedelta

basedir = path.abspath(path.dirname(__file__))
# Load environment variables from .env
load_dotenv(find_dotenv(), verbose=True)


class ConfigFactory(object):
    def factory():
        env = environ.get("ENV", "development").lower()
        if env == 'testing':
            return Testing()
        elif env == 'development':
            return Development()
        elif env == 'docker':
            return Docker()
        elif env == 'production':
            return Production()


class Config:
    """Base config."""
    DEBUG = False
    TESTING = False
    NEWS_API_KEY = environ.get('NEWS_API_KEY')
    SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI_KEY')
    CELERY = {
        'broker_url' : environ.get('BROKER_URL'),
        'result_backend': environ.get('RESULT_BACKEND_URL'),
        'task_ignore_result': True  
    }
    
    JWT_SECRET_KEY = environ.get('JWT_SECRET_KEY')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=30)  # 30 minutes
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=1)  # 1 day


class Development(Config):
    DEBUG = True
    TESTING = False


class Production(Config):
    DEBUG = False
    TESTING = False


class Testing(Config):
    DEBUG = True
    TESTING = True


class Docker(Config):
    DEBUG = False
    TESTING = False
