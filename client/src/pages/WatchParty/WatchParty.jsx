import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api, { errMsg } from "../../services/api";
import socket from "../../socket/socket";
import MoviePlayer from "../../features/movie-player/MoviePlayer";
import ScreenShare from "../../features/movie-player/ScreenShare";
import VideoCall from "../../features/video-call/VideoCall";
import Chat from "../../features/chat/Chat";

export default function WatchParty() {
  const { code } = useParams();
  const nav = useNavigate();
  const [room, setRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [mode, setMode] = useState("screen");

  useEffect(() => {
    let cancelled = false;
    api.get(`/rooms/${code}`).then(({ data }) => {
      if (cancelled) return;
      setRoom(data);
      socket.auth = { token: localStorage.getItem("token") };
      const join = () => { socket.emit("join-room", { roomCode: data.code }); setReady(true); };
      socket.on("connect", join);
      socket.on("members", setMembers);
      socket.on("room-error", setErr);
      socket.on("connect_error", (e) => setErr(e.message));
      socket.connect();
    }).catch((e) => setErr(errMsg(e)));

    return () => {
      cancelled = true;
      socket.off("connect"); socket.off("members"); socket.off("room-error"); socket.off("connect_error");
      socket.disconnect();
    };
  }, [code]);

  if (err) return <div className="center"><div className="card"><span className="error">{err}</span><button onClick={() => nav("/")}>Home</button></div></div>;
  if (!room || !ready) return <div className="center muted">Connecting…</div>;

  return (
    <>
      <div className="topbar">
        <span className="logo">🎬 {room.name}</span>
        <div className="row" style={{ alignItems: "center" }}>
          <span className="muted">Code: <b style={{ color: "#fff" }}>{room.code}</b></span>
          <button className="secondary" onClick={() => navigator.clipboard.writeText(room.code)}>Copy</button>
          <button className="secondary" onClick={() => nav("/")}>Leave</button>
        </div>
      </div>
      <div className="party">
        <div className="party-main">
          <div className="row">
            <button className={mode === "screen" ? "" : "secondary"} onClick={() => setMode("screen")}>🖥️ Screen share</button>
            <button className={mode === "url" ? "" : "secondary"} onClick={() => setMode("url")}>🔗 Video URL</button>
          </div>
          <div style={{ display: mode === "screen" ? "block" : "none" }}><ScreenShare /></div>
          <div style={{ display: mode === "url" ? "block" : "none" }}><MoviePlayer initialUrl={room.videoUrl} /></div>
          <VideoCall />
        </div>
        <div className="party-side">
          <div className="panel"><b>In room ({members.length})</b><div className="muted">{members.join(", ")}</div></div>
          <Chat />
        </div>
      </div>
    </>
  );
}