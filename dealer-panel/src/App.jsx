import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { DealerProvider, useDealer } from "./contexts/DealerContext.jsx";
import DealerLogin from "./pages/Login/DealerLogin.jsx";
import DealerRegister from "./pages/Register/DealerRegister.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import VehicleManagement from "./pages/Vehicles/VehicleManagement.jsx";
import Analytics from "./pages/Analytics/Analytics.jsx";
import Settings from "./pages/Settings/Settings.jsx";
import Navbar from "./components/Navbar.jsx";
import "./App.css";

function ProtectedRoute({ children }) {
  const { dealer, loading } = useDealer();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <img src="/src/assets/Logo.png" alt="Cabik Logo" className="loading-logo" />
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { dealer } = useDealer();

  return (
    <>
      {dealer && <Navbar />}
      <Routes>
        <Route 
          path="/login" 
          element={dealer ? <Navigate to="/dashboard" replace /> : <DealerLogin />} 
        />

        <Route 
          path="/register" 
          element={dealer ? <Navigate to="/dashboard" replace /> : <DealerRegister />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/vehicles" 
          element={
            <ProtectedRoute>
              <VehicleManagement />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/analytics" 
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <DealerProvider>
        <AppRoutes />
      </DealerProvider>
    </Router>
  );
}
