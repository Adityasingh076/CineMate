import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <>
      <div className="topbar">
        <span className="logo">🎬 CineMate</span>
        <div className="row" style={{ alignItems: "center" }}>
          <span className="muted">{user.name}</span>
          <button className="secondary" onClick={logout}>Logout</button>
        </div>
      </div>
      <div className="center" style={{ minHeight: "calc(100vh - 57px)" }}>
        <div className="card">
          <h2>Hi, {user.name} 👋</h2>
          <span className="muted">Start a watch party or jump into a friend's room.</span>
          <button onClick={() => nav("/create")}>Create a room</button>
          <button className="secondary" onClick={() => nav("/join")}>Join with a code</button>
        </div>
      </div>
    </>
  );
}
