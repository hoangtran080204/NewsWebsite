import React, {useState} from 'react'

const SearchBar = ({setArticles}) => {
    const [userInput, setUserInput] = useState(""); //state variables to store user input
    
    const handleSearch = async() => {
        if(userInput){
            //Flask API call to retrieve all articles containing keywords that match user input
            const response = await fetch(`/search?q=${(userInput)}`, {
                method: "GET",
            });
            const searched_articles = await response.json() 
            console.log(searched_articles)
            setArticles(searched_articles)
        }
    }
  
  
    return (
        <div className="search-bar-container">
            <h1>News Website</h1>
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
    )
}

export default SearchBar