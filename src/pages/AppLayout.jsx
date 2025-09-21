import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Login from "../auth/Login";
import Register from "../auth/Register";
import ForgotPassword from "../auth/ForgotPassword";

export default function AppLayout() {
  const [which, setWhich] = useState(null); // 'login' | 'signup' | 'forgot' | null

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
          onOpenForgot={() => setWhich("forgot")}
        />
      )}
      {which === "signup" && (
        <Register
          onSuccess={() => setWhich(null)}
          onClose={() => setWhich(null)}
          onOpenLogin={() => setWhich("login")}   
        />
      )}
      {which === "forgot" && (
        <ForgotPassword onClose={() => setWhich(null)} />
      )}
    </>
  );
}
