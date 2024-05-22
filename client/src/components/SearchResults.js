import React from "react";

import ArticleCard from "./ArticleCard";

const SearchResults = ({ articles, searchMessage }) => {
  return (
    <div className="results-container">
      <div className="results-stack">
        {articles.length > 0 ? (
          articles.map((article) => <ArticleCard article={article} />)
        ) : (
          <h2>{searchMessage}</h2>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
