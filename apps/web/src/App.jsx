import { Routes, Route, Navigate } from "react-router-dom";
import CustomerFlow from "./pages/CustomerFlow.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/c/demo" replace />} />

      {/* Public */}
      <Route path="/c/:slug" element={<CustomerFlow />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <Admin />
          </RequireAuth>
        }
      />

      {/* 404 */}
      <Route path="*" element={<div style={{ padding: 20, color: "white" }}>404 Not Found</div>} />
    </Routes>
  );
}