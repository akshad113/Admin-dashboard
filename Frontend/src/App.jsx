import Users from "./pages/Users";
import Categories from "./pages/Categories";
import Products from "./pages/Products";
import Other from "./pages/Other";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Sidebar from "./components/Sidebar1";
import Dashboard from "./pages/Dashboard";
import LogIn from "./components/logIn";
import ProtectedRoute from "./components/Protected";

import "@flaticon/flaticon-uicons/css/all/all.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import TopBar from "./components/TopBar";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Login Route */}
        <Route path="/login" element={<LogIn />} />

        {/* Protected Admin Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="flex bg-slate-100 min-h-screen items-start">
                <Sidebar />
                <div className="flex-1 px-6">
                  <TopBar />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/others" element={<Other />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
  
export default App;
