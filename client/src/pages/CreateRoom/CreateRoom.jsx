import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import api, { errMsg } from "../../services/api";
import backgroundImage from "../../assets/create_room_bg.png";

export default function CreateRoom() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [roomName, setRoomName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPrivate, setIsPrivate] = useState(false);
  const [enableChat, setEnableChat] = useState(true);
  const [enableVideo, setEnableVideo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    setLoading(true);
    setError("");

    try {
      // 1. Send room details to your backend API to save it in the database
      // Adjust the endpoint URL (e.g., "/rooms") if your backend route differs
      const { data } = await api.post("/rooms", {
        name: roomName,
        maxParticipants,
        isPrivate,
        enableChat,
        enableVideo,
      });

      // 2. Extract the actual room code/identifier returned by your server database
      const roomCode = data.code || data._id || data.id;

      if (!roomCode) {
        throw new Error("Server failed to return a valid room code.");
      }

      // 3. Navigate to WatchParty using the real backend room code
      nav(`/room/${roomCode}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      setError(errMsg(err));
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
            maxWidth: "520px",
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
              Create a Watch Party
            </h2>
            <p style={{ color: "#9aa0a6", fontSize: "0.95rem", margin: 0 }}>
              Configure your room settings and invite friends to watch together.
            </p>
          </div>

          {error && (
            <div style={{ marginBottom: "20px", color: "#ff6b6b", fontSize: "0.9rem", background: "rgba(255, 107, 107, 0.1)", padding: "10px", borderRadius: "6px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleCreateRoom} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Room Name Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Room Name
              </label>
              <input
                type="text"
                placeholder="e.g., Friday Movie Night 🍿"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Max Participants Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#ccc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Max Participants ({maxParticipants})
              </label>
              <input
                type="range"
                min="2"
                max="50"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "#e50914",
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Feature Toggles */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "10px" }}>
              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", color: "#ddd" }}>💬 Enable Live Chat</span>
                <input
                  type="checkbox"
                  checked={enableChat}
                  onChange={(e) => setEnableChat(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#e50914", cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", color: "#ddd" }}>📹 Enable Video Calls (WebRTC)</span>
                <input
                  type="checkbox"
                  checked={enableVideo}
                  onChange={(e) => setEnableVideo(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#e50914", cursor: "pointer" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", color: "#ddd" }}>🔒 Private Room</span>
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#e50914", cursor: "pointer" }}
                />
              </label>
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "15px",
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
              {loading ? "Creating Room..." : "🚀 Launch Room"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}