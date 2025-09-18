// src/AuthForms.jsx
import { useState } from "react";
import api, { bootCsrf } from "../routes/api.js";

export default function Register({ onSuccess, onClose }) {
  const [f, setF] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setShowPw] = useState({ password: false, confirm: false });
  const [err, setErr] = useState(null);
  const onChange = (e) => setF({ ...f, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await bootCsrf();
      const payload = { ...f, role: "student" };
      const { data } = await api.post("/api/register", payload);
      onSuccess?.(data.user);
    } catch (ex) {
      const res = ex.response?.data;
      const fieldErrors = res?.errors ? Object.values(res.errors).flat() : [];
      setErr(
        fieldErrors.join("\n") || res?.message || "Eroare la înregistrare"
      );
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

      <div className="field name-first">
        <input
          id="first_name"
          name="first_name"
          placeholder=" "
          value={f.first_name}
          onChange={onChange}
          required
        />
        <label htmlFor="first_name">Prenume</label>
      </div>

      <div className="field name-last">
        <input
          id="last_name"
          name="last_name"
          placeholder=" "
          value={f.last_name}
          onChange={onChange}
          required
        />
        <label htmlFor="last_name">Nume</label>
      </div>

      <div className="field icon email">
        <input
          id="email"
          name="email"
          type="email"
          placeholder=" "
          value={f.email}
          onChange={onChange}
          required
        />
        <label htmlFor="email">Email</label>
      </div>

      {/* Parolă */}
      <div className="field icon password has-eye">
        <input
          id="password"
          name="password"
          type={showPw.password ? "text" : "password"}
          placeholder=" "
          value={f.password}
          onChange={onChange}
          required
        />
        <label htmlFor="password">Parolă</label>

        <button
          type="button"
          className="pw-toggle"
          aria-label={showPw.password ? "Ascunde parola" : "Afișează parola"}
          aria-pressed={showPw.password}
          onClick={() => setShowPw((s) => ({ ...s, password: !s.password }))}
        >
          {/* eye / eye-off inline SVG */}
          {showPw.password ? (
            /* eye-off */
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18"/>
              <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 4c7 0 10 8 10 8a13.22 13.22 0 01-3.76 4.92M6.24 6.24A13.22 13.22 0 002 12s3 8 10 8a10.9 10.9 0 006.12-1.88"/>
            </svg>
          ) : (
            /* eye */
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {/* Confirmă parola */}
      <div className="field icon password has-eye">
        <input
          id="password_confirmation"
          name="password_confirmation"
          type={showPw.confirm ? "text" : "password"}
          placeholder=" "
          value={f.password_confirmation}
          onChange={onChange}
          required
        />
        <label htmlFor="password_confirmation">Confirmă parola</label>

        <button
          type="button"
          className="pw-toggle"
          aria-label={showPw.confirm ? "Ascunde parola" : "Afișează parola"}
          aria-pressed={showPw.confirm}
          onClick={() => setShowPw((s) => ({ ...s, confirm: !s.confirm }))}
        >
          {showPw.confirm ? (
            /* eye-off */
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l18 18"/>
              <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 4c7 0 10 8 10 8a13.22 13.22 0 01-3.76 4.92M6.24 6.24A13.22 13.22 0 002 12s3 8 10 8a10.9 10.9 0 006.12-1.88"/>
            </svg>
          ) : (
            /* eye */
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>

      {err && <div className="error">{err}</div>}
      <button type="submit">Creează cont</button>
    </form>
  );
}
