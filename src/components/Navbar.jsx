import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/auth";

export default function Navbar({ onOpenLogin, onOpenSignup }) {
  const { me, logout } = useAuth();
  const navigate = useNavigate();
  //console.log("me", me)
  return (
    <header className="nav">
      <div className="logo">
        <Link to="/" className="logo-box">bac-ready.md</Link>
      </div>

      <nav className="nav-links">
        <button type="button">Pricing ▾</button>
        <button
            type="button"

            onClick={() => navigate("/")}
          >
            Home
          </button>
        {!me?.id ? (
          <>
            <button type="button" className="link" onClick={onOpenLogin}>
              Log In
            </button>
            <button type="button" className="cta" onClick={onOpenSignup}>
              Sign up
            </button>
          </>
        ) : (
          <>
            <span className="welcome">
              Bun venit, <strong>{me.first_name} {me.last_name}</strong>
            </span>
            <button type="button" className="link" onClick={logout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
