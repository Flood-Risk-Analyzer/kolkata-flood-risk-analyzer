import "../styles/Style.css";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="wave">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <div className="hero-center">
          <div className="box">
            <span className="sizer">Flood Risk Analyzer</span>

            <h2>Flood Risk Analyzer</h2>
            <h2>Flood Risk Analyzer</h2>
            <h2>Flood Risk Analyzer</h2>
            <h2>Flood Risk Analyzer</h2>
            <h2>Flood Risk Analyzer</h2>
            <h2>Flood Risk Analyzer</h2>
          </div>
        </div>
      </section>

      <div className="fixed-cta">
        <button
          className="get-started-btn"
          onClick={() => navigate("/analyze")}
        >
          Get Started
        </button>
      </div>
    </>
  );
}
