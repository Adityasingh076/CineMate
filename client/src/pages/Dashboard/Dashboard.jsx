import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
// Import your existing asset file correctly
import backgroundImage from "../../assets/watch_party.png";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  // Safety fallback if user data is still resolving
  if (!user) {
    return (
      <div className="center muted" style={{ minHeight: "100vh", color: "#fff", background: "#121212" }}>
        Loading dashboard...
      </div>
    );
  }

  // Layout style utilizing your watch_party.png background
  const layoutStyle = {
    minHeight: "100vh",
    background: `linear-gradient(rgba(10, 10, 20, 0.85), rgba(10, 10, 20, 0.92)), url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  };

  return (
    <div style={layoutStyle}>
      {/* 1. TOP NAVBAR */}
      <div
        className="topbar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 40px",
          background: "rgba(10, 10, 20, 0.75)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 10,
        }}
      >
        <span
          className="logo"
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff",
          }}
        >
          🎬 CineMate
        </span>
        <div
          className="row"
          style={{ display: "flex", alignItems: "center", gap: "25px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "#6366f1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "1rem",
                color: "#fff",
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span style={{ fontWeight: 500, color: "#eee" }}>
              {user.name}
            </span>
          </div>
          <button
            className="secondary"
            onClick={logout}
            style={{ padding: "8px 18px", cursor: "pointer", fontSize: "0.9rem" }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div
        className="center"
        style={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px",
          zIndex: 1,
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "480px",
            width: "100%",
            textAlign: "center",
            padding: "50px 35px",
            borderRadius: "20px",
            background: "rgba(15, 23, 42, 0.75)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>🍿</div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "2.2rem",
              fontWeight: "bold",
            }}
          >
            Hi, {user.name}!
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#94a3b8",
              marginBottom: "35px",
              lineHeight: "1.5",
            }}
          >
            Ready for movie night? Jump right into a synchronized watch party or create your own room.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <button
              onClick={() => nav("/create")}
              style={{
                padding: "15px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "10px",
                background: "#6366f1",
                border: "none",
                color: "#fff",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
              }}
            >
              🚀 Create a Room
            </button>
            <button
              className="secondary"
              onClick={() => nav("/join")}
              style={{
                padding: "15px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#cbd5e1",
              }}
            >
              🔗 Join with Code
            </button>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginTop: "35px",
              paddingTop: "20px",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#94a3b8",
              fontSize: "0.85rem",
            }}
          >
            <div>⚡ Sync Playback</div>
            <div>💬 Live Chat</div>
            <div>📹 Video Calls</div>
          </div>
        </div>
      </div>
    </div>
  );
}