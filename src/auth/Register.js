// src/AuthForms.jsx
import { useState } from "react";
import api, { bootCsrf } from "../routes/api.js"

export default function Register({ onSuccess, onClose }) {
  const [f, setF] = useState({ first_name:"", last_name:"", email:"", role: "", password:"", password_confirmation:"" });
  const [err, setErr] = useState(null);
  const onChange = e => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e){
    e.preventDefault();
    setErr(null);
    try{
      await bootCsrf();
      const payload = { ...f, role: "student" };
      const { data } = await api.post("/api/register", payload);
      onSuccess?.(data.user);
    } catch (ex) {
      const res = ex.response?.data;
      const fieldErrors = res?.errors ? Object.values(res.errors).flat() : [];
      setErr(fieldErrors.join("\n") || res?.message || "Eroare la înregistrare");
    }
  }

  return (
    <form onSubmit={submit} className="auth-form">
      <button
        type="button"
        className="close-btn"
        aria-label="Închide"
        onClick={onClose}
      >
        ✕
      </button>

      <h3>Sign up</h3>
      <input name="first_name" placeholder="Prenume" value={f.first_name} onChange={onChange} required />
      <input name="last_name"  placeholder="Nume" value={f.last_name} onChange={onChange} required />
      <input name="email" type="email" placeholder="Email" value={f.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Parolă" value={f.password} onChange={onChange} required />
      <input name="password_confirmation" type="password" placeholder="Confirmă parola" value={f.password_confirmation} onChange={onChange} required />
      {err && <div className="error">{err}</div>}
      <button type="submit">Creează cont</button>
    </form>
  );
}


