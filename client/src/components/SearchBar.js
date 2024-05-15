import React, {useState} from 'react'
import { Box, Stack, Button, TextField } from "@mui/material";

const SearchBar = ({setArticles}) => {
    const [userInput, setUserInput] = useState(""); //store user input
    const handleSearch = async() => {
        if(userInput){
            //Flask API call to retrieve all articles containing keywords that match user input
            const response = await fetch(`/search?q=${encodeURIComponent(userInput)}`, {
                method: "GET",
            });
            const searched_articles = await response.json() 
            
            setArticles(searched_articles)
            setUserInput('') // clear text field after finishing search
        }
    }
  
  
    return (
        <Stack alignItems="center" mt="37px" justifyContent="center" p="20px">
            <Box position="relative" mb="72px">
                <TextField height="76px"
                sx={{
                    input: { fontWeight: "700", border: "none", borderRadius: "4px" },
                    width: "1000px",
                    backgroundColor: "#fff",
                    borderRadius: "40px",
                }}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value.toLowerCase())}
                placeholder="Search Articles"
                type="text"
                />
                <Button
                sx={{
                    bgcolor: "#FF2625",
                    color: "#fff",
                    textTransform: "none",
                    width: "173px",
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