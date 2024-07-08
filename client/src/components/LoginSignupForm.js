import React, { useState } from "react";

const LoginSignupForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    // TODO: API call (GET) for login
    console.log("Login:", username, password);
  };

  const handleSignup = (e) => {
    e.preventDefault();
    // TODO: API call (POST) for signup
    console.log("Signup:", username, password);
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
