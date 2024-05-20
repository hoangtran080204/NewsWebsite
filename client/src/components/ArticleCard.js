import React from 'react'

import { Button, Stack, Typography } from '@mui/material';

const ArticleCard = ({article}) => {
    
  
    return (
    <a className="article-card" href={article.url} target="_blank" rel="noreferrer">
        <img src={article.urlToImage} alt={article.description} loading="lazy" />
        <Stack direction="row" >
          <Button sx={{ color: '#fff', background: '#FFA9A9', fontSize: '14px', borderRadius: '20px', textTransform: 'capitalize' }}>
            {article.author}
          </Button>
          <Button sx={{ color: '#fff', background: '#FCC757', fontSize: '14px', borderRadius: '20px', textTransform: 'capitalize' }}>
            {article.source.name}
          </Button>
        </Stack>
        <Typography color="#000" fontWeight="bold" sx={{ fontSize: '20px' }} mt="10px" pb="10px" textTransform="capitalize">
          {article.title}
        </Typography>
    </a>
  )
}

export default ArticleCard