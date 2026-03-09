import { Navigate, Outlet, useLocation } from "react-router-dom";
import { hasRetailerAccess } from "../lib/auth";

function ProtectedRoute() {
  const location = useLocation();
  const canAccess = hasRetailerAccess();

  if (!canAccess) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
