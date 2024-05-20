import React, {useState} from 'react'

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const Home = () => {
   const [articles, setArticles] = useState([])
   return (
    <div>
      <SearchBar setArticles={setArticles} />
      <SearchResults articles = {articles} />
    </div>
  )
}

export default Home