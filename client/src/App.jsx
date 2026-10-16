import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./features/auth/ProtectedRoute.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import CreateRoom from "./pages/CreateRoom/CreateRoom.jsx";
import JoinRoom from "./pages/JoinRoom/JoinRoom.jsx";
import WatchParty from "./pages/WatchParty/WatchParty.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><CreateRoom /></ProtectedRoute>} />
      <Route path="/join" element={<ProtectedRoute><JoinRoom /></ProtectedRoute>} />
      <Route path="/room/:code" element={<ProtectedRoute><WatchParty /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
