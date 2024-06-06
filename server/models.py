from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Article(Base):
    __tablename__ = 'articles'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    author = Column(String(255), nullable=True)
    source_name = Column(String(255), nullable=True)
    url = Column(String(2048), unique=True, nullable=False)
    urlToImage = Column(String(2048), nullable=True)
