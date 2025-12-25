import React, { createContext, useState, useContext } from "react";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  /* SAFE LOAD USER */
  const loadUser = () => {
    const stored = localStorage.getItem("cabik-user");
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem("cabik-user");
      return null;
    }
  };

  const [user, setUser] = useState(loadUser());

  const login = (userData) => {
    if (!userData) return;
    localStorage.setItem("cabik-user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("cabik-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
