import { Routes, Route } from "react-router-dom";

// Pages
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";

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

    </Routes>
  );
}

export default App;