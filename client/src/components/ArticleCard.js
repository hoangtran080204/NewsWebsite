import React from 'react'

const ArticleCard = ({article}) => {
  return (
    <a className="article-card" href={article.url} target="_blank" rel="noreferrer">
        <img src={article.urlToImage} alt={article.description} loading="lazy" />
        <div className="article-stack">
            <div className="article-author">
                {article.author}
            </div>
            <div className="article-source">
                {article.source.name}
            </div>
        </div>
        <div className="article-title">
                {article.title}
        </div>
    </a>
  )
}

export default ArticleCard