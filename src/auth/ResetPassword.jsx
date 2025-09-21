// src/auth/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Dialog from "../components/Dialog";
import api, { bootCsrf } from "../routes/api";
import { useAuth } from "./auth.js";
import "../App.css";

export default function ResetPassword() {
  const { token } = useParams();    
  const { login } = useAuth();         
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPw, setShowPw] = useState({ password: false, confirm: false });
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState(null); 
  



  const [dlg, setDlg] = useState({
    open: false,
    title: "",
    msg: "",
    onClose: null, // callback opțional la închidere (ex. navigate)
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const email = params.get("email");
    if (email) {
      setForm((s) => ({ ...s, email }));
      return;
    }
    // fallback: ia-l din backend
    (async () => {
      try {
        const { data } = await api.get(`/api/reset-password/${token}`);
        if (data?.email) setForm((s) => ({ ...s, email: data.email }));
      } catch {
        // opțional: afișează un mesaj/redirectează la forgot
      }
    })();
  }, [location.search, token]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setErrors(null);
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setErrors(null);

    if ((form.password ?? "").length < 8) {
      setErrors("Parola trebuie să conțină cel puțin 8 caractere.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrors("Parola și confirmarea nu coincid.");
      return;
    }

    try {
      setBusy(true);
      await bootCsrf();
      const { data } = await api.post(`/api/reset-password/${token}`, {
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      if (data?.status === 200) {
        setDlg({
          open: true,
          title: "Parola a fost schimbată",
          msg: "Te conectăm automat...",
          onClose: async () => {
            await login({
              email: form.email,
              password: form.password,
              remember: true,
            });
            navigate("/");
          },
        });
        return;
      }

      if (data?.status === 404) {
        setDlg({
          open: true,
          title: "Link invalid sau expirat",
          msg: data?.message || "Reîncearcă procedura de resetare.",
          onClose: () => navigate("/forgot-password"),
        });
        return;
      }

      const val = data?.validation_errors;
      if (val && typeof val === "object") setErrors(val);
      else setErrors(data?.message || "Eroare la resetarea parolei.");
    } catch (ex) {
      const res = ex?.response?.data;
      const val = res?.validation_errors || res?.errors;
      if (val && typeof val === "object") setErrors(val);
      else setErrors(res?.message || ex?.message || "Eroare la resetarea parolei.");
    } finally {
      setBusy(false);
    }
  };

  // Render mic helper pentru erori (suportă atât string, cât și obiect { field: [msgs] })
  const renderErrors = (err) => {
    if (!err) return null;
    if (typeof err === "string") return <div className="error">{err}</div>;
    const list = Object.entries(err).flatMap(([k, arr]) =>
      Array.isArray(arr) ? arr.map((m, i) => `${k}: ${m}`) : []
    );
    return list.length ? (
      <div className="error">
        {list.map((m, i) => (
          <div key={i}>{m}</div>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="modal" role="presentation">
      <form className="auth-form" onSubmit={submit}>
        <h3>Setează o parolă nouă</h3>

        <div className="field icon email">
          <input
            id="email"
            name="email"
            type="email"
            placeholder=" "
            value={form.email}
            onChange={onChange}
            required
            autoComplete="email"
            readOnly={!!form.email}
          />
          <label htmlFor="email">Email</label>
        </div>

        <div className="field icon password has-eye">
          <input
            id="password"
            name="password"
            type={showPw.password ? "text" : "password"}   
            placeholder=" "
            value={form.password}
            onChange={onChange}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <label htmlFor="password">Parola</label>

          <button
            type="button"
            className="pw-toggle"
            aria-label={showPw.password ? "Ascunde parola" : "Afișează parola"}
            aria-pressed={showPw.password}
            onClick={() =>
              setShowPw((s) => ({ ...s, password: !s.password }))
            }
          >
            {showPw.password ? (
              // eye-off
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 4c7 0 10 8 10 8a13.22 13.22 0 01-3.76 4.92M6.24 6.24A13.22 13.22 0 002 12s3 8 10 8a10.9 10.9 0 006.12-1.88" />
              </svg>
            ) : (
              // eye
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
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
            value={form.password_confirmation}
            onChange={onChange}
            required
            autoComplete="new-password"
          />
          <label htmlFor="password_confirmation">Confirmă parola</label>

          <button
            type="button"
            className="pw-toggle"
            aria-label={showPw.confirm ? "Ascunde parola" : "Afișează parola"}
            aria-pressed={showPw.confirm}
            onClick={() =>
              setShowPw((s) => ({ ...s, confirm: !s.confirm }))
            }
          >
            {showPw.confirm ? (
              // eye-off
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 3l18 18" />
                <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42M9.88 4.24A10.94 10.94 0 0112 4c7 0 10 8 10 8a13.22 13.22 0 01-3.76 4.92M6.24 6.24A13.22 13.22 0 002 12s3 8 10 8a10.9 10.9 0 006.12-1.88" />
              </svg>
            ) : (
              // eye
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>

        {renderErrors(errors)}

        <button type="submit" disabled={busy}>
          {busy ? "Se salvează..." : "Resetează parola"}
        </button>
      </form>

      <Dialog
        open={dlg.open}
        title={dlg.title}
        onClose={() => {
          setDlg({ open: false, title: "", msg: "", onClose: null });
          dlg.onClose?.(); 
        }}
      >
        {dlg.msg}
      </Dialog>

    </div>
  );
}
