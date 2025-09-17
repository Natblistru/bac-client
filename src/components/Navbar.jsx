import { Link } from "react-router-dom";

export default function Navbar({ me, onOpenLogin, onOpenSignup, onLogout }) {
  return (
    <header className="nav">
      <div className="logo">
        <Link to="/" className="logo-box">bac-ready.md</Link>
      </div>

      <nav className="nav-links">
        <button type="button">Pricing ▾</button>

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
            <span>
              Bun venit, {me.first_name} {me.last_name}
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
