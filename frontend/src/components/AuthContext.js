
import React, { createContext, useState, useEffect } from 'react';


export const AuthContext = createContext({
  isLoggedIn: false,
  username: '',
  login: (username) => {},
  logout: () => {},
});


export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  
  useEffect(() => {
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setIsLoggedIn(true);
      setUsername(storedUser);
    }
  }, []);

  
  const login = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
    localStorage.setItem('username', user); 
  };

  
  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    localStorage.removeItem('username'); 
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
