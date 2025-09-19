import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Login from "../auth/Login";
import Register from "../auth/Register";

export default function AppLayout() {
  const [which, setWhich] = useState(null); // 'login' | 'signup' | null

  return (
    <>
      <Navbar
        onOpenLogin={() => setWhich("login")}
        onOpenSignup={() => setWhich("signup")}
      />

      <Outlet />

      {which === "login" && (
        <Login
          onSuccess={() => setWhich(null)}
          onClose={() => setWhich(null)}
          onOpenSignup={() => setWhich("signup")}
        />
      )}
      {which === "signup" && (
        <Register
          onSuccess={() => setWhich(null)}
          onClose={() => setWhich(null)}
          onOpenLogin={() => setWhich("login")}   
        />
      )}
    </>
  );
}
