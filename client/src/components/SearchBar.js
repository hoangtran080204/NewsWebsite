import React, { useState } from "react";

const SearchBar = ({ setArticles, setSearchMessage }) => {
  const [userInput, setUserInput] = useState(""); //state variables to store user input
  const handleSearch = async () => {
    if (userInput) {
      //Flask API call to retrieve all articles containing keywords that match user input
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setSearchMessage("You must be logged in to search.");
          return;
        }

        const response = await fetch(
          `http://localhost:8080/search?q=${userInput}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorResponse = await response.json();
          throw new Error(errorResponse.error || "Undefined Error");
        }

        const searched_articles = await response.json();
        setArticles(searched_articles["article_list"]);
      } catch (error) {
        setSearchMessage(
          "Failed to search for articles. Please try again later."
        );
      }
    }
  };

  return (
    <div className="search-bar-container">
      <div className="search-box">
        <input
          className="search-input"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Search Articles"
          type="text"
        />
        <button className="search-button" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
