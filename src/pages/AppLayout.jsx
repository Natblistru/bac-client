import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Login from "../auth/Login";
import Register from "../auth/Register";
import api from "../routes/api";

export default function AppLayout() {
  const [me, setMe] = useState(null);
  const [which, setWhich] = useState(null); // 'login' | 'signup' | null

  return (
    <>
      <Navbar
        me={me}
        onOpenLogin={() => setWhich("login")}
        onOpenSignup={() => setWhich("signup")}
        onLogout={async () => { await api.post("/api/logout"); setMe(null); }}
      />

      <Outlet context={{ me, setMe }} />

      {which === "login" && (
        <div className="modal">
          <Login onSuccess={(u)=>{ setMe(u); setWhich(null); }} onClose={()=>setWhich(null)} />
        </div>
      )}
      {which === "signup" && (
        <div className="modal">
          <Register onSuccess={(u)=>{ setMe(u); setWhich(null); }} onClose={()=>setWhich(null)} />
        </div>
      )}
    </>
  );
}
