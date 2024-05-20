import React from "react";
import {Route, Routes} from 'react-router-dom';

import { Box } from '@mui/material';

import './App.css';
import Home from './pages/Home';
function App() {
  return (
    <Box width = '1400px' m ='auto'>
      <Routes>
        <Route path = "/" element = {<Home/>} />
      </Routes>
    </Box>
  );
}

export default App;
