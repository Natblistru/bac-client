import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DisciplineCard from "../components/DisciplineCard";
import Register from "../auth/Register";
import Login from "../auth/Login";
import api from "../routes/api.js";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [me, setMe] = useState(null);
  const [which, setWhich] = useState(null); // 'login' | 'signup' | null

  const handleAuthClose = () => {
    setWhich(null);          // ← închide modalul
  };

  return (
    <div className="home">
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
            <img
              className="hero-img"
              src={process.env.PUBLIC_URL + "/images/dog_graduated.jpg"}
              alt=""
            />
          </div>
        </div>
      </main>
    </div>
  );
}
