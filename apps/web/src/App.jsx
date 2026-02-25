import { Routes, Route, Navigate } from "react-router-dom";
import CustomerFlow from "./pages/CustomerFlow.jsx";
import Admin from "./pages/Admin.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/c/demo" replace />} />
      <Route path="/c/:slug" element={<CustomerFlow />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
