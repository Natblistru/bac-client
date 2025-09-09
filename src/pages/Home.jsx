import React from "react";
import { useNavigate } from "react-router-dom";
import DisciplineCard from "../components/DisciplineCard";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      {/* Top bar */}
      <header className="nav">
        <div className="logo">
          <span className="logo-box">bac-ready.md</span>
        </div>
        <nav className="nav-links">
          <button>Catalog ▾</button>
          <button>Resources ▾</button>
          <button>Community ▾</button>
          <button>Pricing</button>
          <button className="badge">Live Learning</button>
          <button>For Business</button>
          <button aria-label="Search" className="icon">🔍</button>
          <button className="link">Log In</button>
          <button className="cta">Sign Up</button>
        </nav>
      </header>

      {/* Hero */}
      <main className="hero">
        <div className="hero-card">
          {/* left text */}
          <div className="hero-text">
            <div>
            <h1>
              Imblânzește <br /> fiara 
              <span className="slash"> / </span>
              <span className="highlight">BAC</span>
            </h1>


            <div className="hero-actions">
              <DisciplineCard
                title="Limba română"
                color="#2563eb"
                icon="📘"
                onEvaluari={() => navigate("/discipline/romana/evaluari")}
                onTeme={() => navigate("/discipline/romana/teme")}
              />
              <DisciplineCard
                title="Matematică"
                color="#16a34a"
                icon="➗"
                onEvaluari={() => navigate("/discipline/mate/evaluari")}
                onTeme={() => navigate("/discipline/mate/teme")}
              />
            </div>
            </div>
          </div>

          <div className="hero-media">
            <img className="hero-img" src={process.env.PUBLIC_URL + "/images/dog_graduated.jpg"} alt="" />
          </div>
        </div>
      </main>
    </div>
  );
}