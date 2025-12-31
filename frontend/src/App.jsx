import React from "react";
import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/publicHome/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import VehicleDetail from "./pages/VehicleDetail/vehicleDetail.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Payment from "./pages/Payment/Payment.jsx";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess.jsx";
import Invoice from "./pages/Invoice/Invoice.jsx";

// Auth Protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>

      {/* PUBLIC */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* VEHICLE DETAILS (PUBLIC) */}
      <Route path="/cars/:id" element={<VehicleDetail />} />
      <Route path="/bikes/:id" element={<VehicleDetail />} />
      <Route path="/scooties/:id" element={<VehicleDetail />} />

      {/* 🔐 PROTECTED FLOW */}
      <Route
        path="/checkout/:type/:id"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/payment/:orderId"
        element={
          <ProtectedRoute>
            <Payment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/order-success/:orderId"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoice/:orderId"
        element={
          <ProtectedRoute>
            <Invoice />
          </ProtectedRoute>
        }
      />

      {/* EXAMPLE DASHBOARD */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard Page</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
