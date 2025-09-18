import { useState } from "react";
import api, { bootCsrf } from "../routes/api.js";

export default function LoginForm({ onSuccess, onClose }) {
  const [f, setF] = useState({ email: "", password: "", remember: true });
  const [showPw, setShowPw] = useState({ password: false });
  const [err, setErr] = useState(null);
  const onChange = (e) => {
    const { name, type, checked, value } = e.target;
    setF({ ...f, [name]: type === "checkbox" ? checked : value });
  };

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await bootCsrf();
      const { data } = await api.post("/api/login", f);
      onSuccess?.(data.user);
    } catch (ex) {
      setErr(ex.response?.data?.message || "Eroare la autentificare");
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
      <h3>Log in</h3>
      
      <div className="field">
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
      <div className="field has-eye">
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
      {err && <div className="error">{err}</div>}
      <button type="submit">Intră</button>
    </form>
  );
}
