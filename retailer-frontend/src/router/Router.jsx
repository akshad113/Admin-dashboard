import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Profile from "../pages/Profile";
import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "./ProtectedRoute";
import { hasRetailerAccess } from "../lib/auth";

function Router() {
  const canAccessRetailerRoutes = hasRetailerAccess();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={canAccessRetailerRoutes ? <Navigate to="/" replace /> : <Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;
