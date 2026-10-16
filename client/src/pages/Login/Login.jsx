import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { errMsg } from "../../services/api";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try { await login(f.email, f.password); nav("/"); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h2>🎬 CineMate</h2>
        <span className="muted">Sign in to watch together</span>
        <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <span className="error">{err}</span>}
        <button>Login</button>
        <span className="muted">No account? <Link to="/register">Register</Link></span>
      </form>
    </div>
  );
}
