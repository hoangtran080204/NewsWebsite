import React, {useState} from 'react'
import { Box } from '@mui/material';

import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';

const Home = () => {
   const [articles, setArticles] = useState([])
   return (
    <Box>
      <SearchBar setArticles={setArticles} />
      <SearchResults articles = {articles} />
    </Box>
  )
}

export default Home