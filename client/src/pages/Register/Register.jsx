import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/AuthContext";
import { errMsg } from "../../services/api";

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try { await register(f.name, f.email, f.password); nav("/"); } catch (e) { setErr(errMsg(e)); }
  };

  return (
    <div className="center">
      <form className="card" onSubmit={submit}>
        <h2>Create account</h2>
        <input placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required />
        <input type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required />
        <input type="password" placeholder="Password (6+ chars)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} required />
        {err && <span className="error">{err}</span>}
        <button>Register</button>
        <span className="muted">Have an account? <Link to="/login">Login</Link></span>
      </form>
    </div>
  );
}
