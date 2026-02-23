import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const portal = localStorage.getItem("portal");

  if (!token || portal !== "retailer") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("portal");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
