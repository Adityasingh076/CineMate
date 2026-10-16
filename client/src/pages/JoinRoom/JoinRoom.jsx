import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../../services/api";
import backgroundImage from "../../assets/create_room_bg.png";

export default function JoinRoom() {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setError("");

    try {
      // 1. Verify the room exists on your backend database first
      await api.get(`/rooms/${code}`);

      // 2. If valid, navigate directly into the Watch Party room
      nav(`/room/${code}`);
    } catch (err) {
      console.error("Failed to join room:", err);
      setError(errMsg(err) || "Room not found. Please check your room code.");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: `linear-gradient(180deg, rgba(5, 5, 10, 0.75) 0%, rgba(5, 5, 10, 0.90) 100%), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "rgba(10, 10, 18, 0.6)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <span
          onClick={() => nav("/")}
          style={{
            fontSize: "1.4rem",
            fontWeight: "700",
            cursor: "pointer",
            letterSpacing: "0.5px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          🎬 CineMate
        </span>
        <button
          onClick={() => nav("/")}
          style={{
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "all 0.2s ease",
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      {/* Center Glassmorphism Form Card */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "480px",
            background: "rgba(15, 15, 25, 0.75)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: "16px",
            padding: "40px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          }}
        >
          <div style={{ marginBottom: "30px", textAlign: "left" }}>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                margin: "0 0 8px 0",
                letterSpacing: "-0.5px",
              }}
            >
              Join a Watch Party
            </h2>
            <p style={{ color: "#9aa0a6", fontSize: "0.95rem", margin: 0 }}>
              Enter the 6-character room code provided by the host.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: "20px", color: "#ff6b6b", fontSize: "0.9rem", background: "rgba(255, 107, 107, 0.1)", padding: "10px", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleJoinRoom} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Room Code
              </label>
              <input
                type="text"
                placeholder="e.g., X7K9P2"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1.1rem",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "14px",
                background: "#e50914",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
                fontWeight: "700",
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 4px 15px rgba(229, 9, 20, 0.4)",
                transition: "background 0.2s ease",
              }}
            >
              {loading ? "Verifying Code..." : "🚀 Join Watch Party"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}