import { useState } from "react";
import { createPortal } from "react-dom";
import api, { bootCsrf } from "../routes/api";

export default function ForgotPassword({ onClose }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  console.log("[ForgotPassword] mounted");

  const submit = async (e) => {
    e.preventDefault();
    setErr(null); setMsg(null); setBusy(true);
    try {
      await bootCsrf();
      const { data } = await api.post("/api/forgot-password", { email });
      setMsg(data?.message || "Verifică-ți emailul.");
    } catch (ex) {
      const res = ex?.response?.data;
      const fieldErrors = res?.validation_errors
        ? Object.values(res.validation_errors).flat()
        : [];
      setErr(fieldErrors.join("\n") || res?.message || "Eroare la trimitere.");
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div className="modal modal-forgot" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose?.();
    }}>
      <form onSubmit={submit} className="auth-form">
        <button type="button" className="close-btn" aria-label="Închide" onClick={onClose}>✕</button>
        <h3>Reset password</h3>

        <div className="field icon email">
          <input
            id="forgot_email"
            name="email"
            type="email"
            placeholder=" "
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="forgot_email">Email</label>
        </div>

        {err && <div className="error">{err}</div>}
        {msg && <div className="notice">{msg}</div>}

        <button type="submit" disabled={busy}>
          {busy ? "Trimit..." : "Trimite link-ul"}
        </button>
      </form>
    </div>,
    document.body
  );
}
