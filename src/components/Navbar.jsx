import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ me, onOpenLogin, onOpenSignup, onLogout }) {

  const navigate = useNavigate();
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
        {!me ? (
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
            <button type="button" className="link" onClick={onLogout}>
              Log out
            </button>
          </>
        )}
      </nav>
    </header>
  );
}
