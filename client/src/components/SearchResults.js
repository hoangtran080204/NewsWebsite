import React from 'react'

import {Box, Stack}  from '@mui/material';
import ArticleCard from './ArticleCard';

const SearchResults = ({articles}) => {
  return (
    <Box mt="50px" p="20px">
      <Stack direction = "row" sx={{ gap: '50px' }} flexWrap="wrap" justifyContent="center">
        {articles.length > 0 ? ( // Check if articles array is not empty
          
          articles.map((article) => (
            <ArticleCard article={article} />
          ))
        ) : (
          <h2>Please enter keyword to search for articles.</h2>
        )}
      </Stack>
    </Box>
 
  )
}

export default SearchResults