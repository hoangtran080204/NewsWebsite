import React, {useState} from 'react'

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const Home = () => {
   const [articles, setArticles] = useState([]);
   const [searchMessage, setSearchMessage] = useState("Please enter a keyword to search for articles.");
   return (
    <div>
      <SearchBar setArticles={setArticles} setSearchMessage={setSearchMessage} />
      <SearchResults articles = {articles} searchMessage={searchMessage} />
    </div>
  )
}

export default Home