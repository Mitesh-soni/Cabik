import { createContext, useState,useContext } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  // ---- SAFE JSON PARSE ----
  const loadUser = () => {
    const stored = localStorage.getItem("cabik-user");

    if (!stored) return null;

    try {
      return JSON.parse(stored); // only valid JSON works
    } catch (err) {
      console.error("Invalid JSON in localStorage, clearing…");
      localStorage.removeItem("cabik-user");
      return null;
    }
  };

  const [user, setUser] = useState(loadUser());
  // console.log("Users",user?.user?.username)
  // ---- LOGIN ----
  const login = (userData) => {
    if (!userData) return; // prevent "undefined" from being saved

    localStorage.setItem("cabik-user", JSON.stringify(userData));
    // console.log("Localstorage",localStorage.setItem("cabik-user", JSON.stringify(userData)));
    setUser(userData);
  };

  // ---- LOGOUT ----
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