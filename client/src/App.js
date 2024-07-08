import React from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import UserAuthentication from "./pages/UserAuthentication";

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/user" element={<UserAuthentication />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
}

export default App;
