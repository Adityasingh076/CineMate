import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../../services/api";

export default function CreateRoom() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try { const { data } = await api.post("/rooms", { name, videoUrl }); nav(`/room/${data.code}`); }
    catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h2>Create room</h2>
        <input placeholder="Room name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Video URL (direct .mp4 / .webm link, optional)" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
        {err && <span className="error">{err}</span>}
        <button>Create</button>
        <button type="button" className="secondary" onClick={() => nav("/")}>Back</button>
      </form>
    </div>
  );
}
