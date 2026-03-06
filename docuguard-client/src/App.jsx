// src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Trash from "./pages/trash/Trash";

function App() {
  const { checkAuth } = useAuthStore();

  // The moment the App loads on the screen, ping the backend to check the cookie
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      {/* If someone hits the root domain, send them to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED ROUTES */}
      {/* We wrap the Dashboard inside the ProtectedRoute. */}
      {/* If the ProtectedRoute says YES, it will render the Dashboard where the <Outlet /> is! */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trash" element={<Trash />} />
        </Route>
        {/* Later, we can add /trash or /settings in here too! */}
      </Route>

      {/* CATCH-ALL ROUTE (404 Page) */}
      <Route
        path="*"
        element={<div className="p-10 text-red-500">404 - Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;
