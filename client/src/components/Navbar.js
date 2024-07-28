import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => (
  <div className="navbar">
    <h1 className="navbar-title">News Website</h1>
    <div className="navbar-links">
      <Link to="/" className="nav-link">
        Home
      </Link>
      <Link to="/user" className="nav-link">
        Sign In
      </Link>
    </div>
  </div>
);

export default Navbar;
