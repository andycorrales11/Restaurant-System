

import React, { useState, useContext } from 'react';
import { AuthContext } from '../components/AuthContext'; 

function Login({ onClose }) {
  const { login } = useContext(AuthContext); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    
    const validUsername = 'lbryant';
    const validPassword = 'randompass1';

    if (username === validUsername && password === validPassword) {
      login(username); 
      onClose(); 
    } else {
      setError('Invalid username or password');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="login-modal">
      <div className="login-modal-content">
        <button onClick={onClose} className="close-btn">&times;</button>
        <h2>Log in</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          onKeyPress={handleKeyPress}
          className="login-input"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          onKeyPress={handleKeyPress}
          className="login-input"
        />
        <button onClick={handleLogin} className="btn-secondary">Login</button>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

export default Login;
