from flask import Flask, request, jsonify
from newsapi import NewsApiClient

#Init Flask App
app = Flask(__name__)

#Init News Api
newsapi = NewsApiClient(api_key = '31673bb1bed245e8b253b67389155bb2')



@app.route("/search", methods = ["GET", "POST"])
def search():
    if request.method == "GET":
        searched_term = request.args.get("q")
        searched_articles = newsapi.get_everything(q=searched_term)['articles']
    
    return jsonify(searched_articles)

if __name__ == "__main__":
    app.run(debug=True)