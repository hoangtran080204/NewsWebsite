import React, {useState} from 'react'
import { Box, Stack, Button, TextField } from "@mui/material";

const SearchBar = ({setArticles}) => {
    const [userInput, setUserInput] = useState(""); //state variables to store user input
    
    const handleSearch = async() => {
        if(userInput){
            //Flask API call to retrieve all articles containing keywords that match user input
            const response = await fetch(`/search?q=${(userInput)}`, {
                method: "GET",
            });
            const searched_articles = await response.json() 
            setArticles(searched_articles)
        }
    }
  
  
    return (
        <Stack alignItems="center" mt="30px" justifyContent="center" p="20px">
            <h1>News Website</h1>

            <Box position="relative" mb="72px" mt="50px">
                <TextField height="76px"
                sx={{
                    input: { fontWeight: "700", border: "none", borderRadius: "4px" },
                    width: "1000px",
                    backgroundColor: "#fff",
                    borderRadius: "40px",
                }}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Search Articles"
                type="text"
                />
                <Button
                sx={{
                    backgroundColor: "#FF2625",
                    color: "#fff",
                    textTransform: "none",
                    width: "150px",
                    height: "56px",
                    position: "absolute",
                    right: "0px",
                    fontSize: "20px",
                }}
                onClick={handleSearch}>
                Search
                </Button>
            </Box>
        </Stack>
    )
}

export default SearchBar