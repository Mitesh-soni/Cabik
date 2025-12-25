import React from "react";
import { Routes, Route } from "react-router-dom";
// Pages
import Home from "./pages/publicHome/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import CarDetail from "./pages/VehicleDetail/carDetail.jsx";
import BikeDetail from "./pages/VehicleDetail/bikeDetail.jsx";
import ScootyDetail from "./pages/VehicleDetail/scootyDetail.jsx";
import Checkout from "./pages/Checkout/Checkout.jsx";
import Payment from "./pages/Payment/Payment.jsx";
// import OrderSuccess from "./pages/OrderSuccess/OrderSuccess.jsx"


// Auth Protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>

      {/* SMART HOME (PUBLIC / USER BASED) */}
      <Route path="/" element={<Home />} />

      {/* PROTECTED ROUTES */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <div>Dashboard Page</div>
          </ProtectedRoute>
        }
      />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/cars/:id" element={<CarDetail />} />
      <Route path="/bikes/:id" element={<BikeDetail />} />
      <Route path="/scooties/:id" element={<ScootyDetail />} />
      <Route path="/checkout/car/:id" element={<Checkout />} />
      <Route path="/payment/:orderId" element={<Payment />} />
      {/* <Route path="/order-success/:id" element={<OrderSuccess />} /> */}
    </Routes>
  );
}
export default App;