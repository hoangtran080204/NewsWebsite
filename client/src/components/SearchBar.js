import React, { useState } from "react";
import { apiUrl } from "../constants/Config";
const SearchBar = ({ setArticles, setSearchMessage }) => {
  const [userInput, setUserInput] = useState(""); //state variables to store user input

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${apiUrl}/refresh-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.access_token);
      return data.access_token;
    } catch (error) {
      console.error("Error refreshing access token:", error);
      throw error;
    }
  };

  const handleSearch = async () => {
    if (userInput) {
      //Flask API call to retrieve all articles containing keywords that match user input
      try {
        let accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setSearchMessage("You must be logged in to search.");
          return;
        }

        let response = await fetch(`${apiUrl}/search?q=${userInput}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.status === 401) {
          // If the access token is expired, refresh it
          try {
            accessToken = await refreshAccessToken();
            response = await fetch(`${apiUrl}/search?q=${userInput}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
          } catch (error) {
            setSearchMessage("You are logged out. Please log in again.");
            return;
          }
        }

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
