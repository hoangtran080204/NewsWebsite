from flask import Flask, request, jsonify
from newsapi import NewsApiClient

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

#Init Flask App
app = Flask(__name__)

#Init News Api
newsapi = NewsApiClient(api_key=os.getenv("NEWS_API_KEY"))

#API endpoint for handling search request based on user input
@app.route("/search", methods = ["GET", "POST"])
def search():
    if request.method == "GET":
        searched_term = request.args.get("q")
        searched_articles = newsapi.get_everything(q=searched_term, language='en', sort_by='relevancy', page = 1)['articles']
    
    return jsonify(searched_articles)


if __name__ == "__main__":
    app.run(debug=True)