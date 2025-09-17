import { useState } from "react";
import api, { bootCsrf } from "../routes/api.js"

export default function LoginForm({ onSuccess, onClose }) {
  const [f, setF] = useState({ email:"", password:"", remember:true });
  const [err, setErr] = useState(null);
  const onChange = e => {
    const { name, type, checked, value } = e.target;
    setF({ ...f, [name]: type === "checkbox" ? checked : value });
  };

  async function submit(e){
    e.preventDefault();
    setErr(null);
    try{
      await bootCsrf();
      const { data } = await api.post("/api/login", f);
      onSuccess?.(data.user);
    }catch(ex){
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
      <input name="email" type="email" placeholder="Email" value={f.email} onChange={onChange} required />
      <input name="password" type="password" placeholder="Parolă" value={f.password} onChange={onChange} required />
      <label><input type="checkbox" name="remember" checked={f.remember} onChange={onChange}/> Ține-mă minte</label>
      {err && <div className="error">{err}</div>}
      <button type="submit">Intră</button>
    </form>
  );
}