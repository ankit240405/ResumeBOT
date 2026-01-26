import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("authToken");
    if (saved) setToken(saved);
  }, []);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("authToken", newToken);

  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("authToken");
        window.location.href = "/login"; 
  };

  const value = { token, login, logout, isAuthenticated: !!token };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
