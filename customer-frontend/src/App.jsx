import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import { useAuthStore } from "./store/useAuthStore.js";

export default function App() {
  const hydrateCustomer = useAuthStore((state) => state.hydrateCustomer);

  useEffect(() => {
    hydrateCustomer();
  }, [hydrateCustomer]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
