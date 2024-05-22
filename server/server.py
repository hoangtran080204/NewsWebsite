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
@app.route("/search", methods = ["GET"])
def search():
    if request.method == "GET":
        searched_term = request.args.get("q")

        try:
            response = newsapi.get_everything(q=searched_term, language='en', sort_by='relevancy', page = 1)
            # Check the response status from NewsAPI
            if response['status'] == 'ok':
                searched_articles = response['articles']
                return jsonify(searched_articles)
            elif response['status'] == 'error':
                # Return specific error message from NewsAPI in case of failure
                error_message = response['message']
                return jsonify({"error": error_message}), 500

        except Exception as e:
            # Handle any exceptions that are not explicitly raised by NewsAPI
            return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)