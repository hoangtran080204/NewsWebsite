import React, { useState } from "react";

const LoginSignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL;
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage(data.message);
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${apiUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        setMessage(data.message);
      } else {
        setMessage(data.message || "An error occurred");
      }
    } catch (error) {
      setMessage("An error occurred");
    }
  };

  return (
    <div className="login-signup-container">
      <form className="login-signup-form">
        <h2 className="form-title">Welcome</h2>
        <div className="input-group">
          <input
            className="user-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="user-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {message && <p className="confirmation-message">{message}</p>}
        </div>

        <div className="button-group">
          <button className="login-button" onClick={handleLogin}>
            Login
          </button>
          <button className="signup-button" onClick={handleSignup}>
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginSignupForm;
