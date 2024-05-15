import React from 'react'

import {Box} from '@mui/material';


const SearchResults = ({articles}) => {
  const name = articles[0]["author"];
  const url = articles[0]["url"];
  const description  = articles[0]["description"];
  return (
    <div>
        <p>{name}</p>
        <p>{url}</p>
        <p>{description}</p>
    </div>
    
   
 
  )
}

export default SearchResults