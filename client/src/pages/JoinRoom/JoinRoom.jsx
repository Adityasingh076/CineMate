import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { errMsg } from "../../services/api";

export default function JoinRoom() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try { const { data } = await api.get(`/rooms/${code.trim()}`); nav(`/room/${data.code}`); }
    catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h2>Join room</h2>
        <input placeholder="Room code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} required />
        {err && <span className="error">{err}</span>}
        <button>Join</button>
        <button type="button" className="secondary" onClick={() => nav("/")}>Back</button>
      </form>
    </div>
  );
}
