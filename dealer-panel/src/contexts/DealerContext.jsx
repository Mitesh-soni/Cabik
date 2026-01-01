import { createContext, useContext, useState, useEffect } from "react";
import { dealerLogin, getDealerProfile } from "../api/dealerApi.js";

export const DealerContext = createContext();

export function DealerProvider({ children }) {
  const [dealer, setDealer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("dealer_token");
    if (token) {
      fetchDealerProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDealerProfile = async () => {
    try {
      const res = await getDealerProfile();
      setDealer(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch dealer profile:", err);
      localStorage.removeItem("dealer_token");
      setDealer(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await dealerLogin(email, password);
      const { token, dealer: dealerData } = res.data;
      
      localStorage.setItem("dealer_token", token);
      setDealer(dealerData);
      setError(null);
      
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Login failed";
      setError(errorMsg);
      console.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("dealer_token");
    setDealer(null);
    setError(null);
  };

  return (
    <DealerContext.Provider value={{ dealer, loading, error, login, logout }}>
      {children}
    </DealerContext.Provider>
  );
}

export function useDealer() {
  const context = useContext(DealerContext);
  if (!context) {
    throw new Error("useDealer must be used within DealerProvider");
  }
  return context;
}
