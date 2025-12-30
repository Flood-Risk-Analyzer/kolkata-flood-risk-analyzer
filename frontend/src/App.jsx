import { Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Landing from "./pages/Landing";
import Analyzer from "./pages/Analyzer";
import RiskMap from "./pages/RiskMap";

function Insights() {
  return (
    <div style={{ padding: "24px", color: "#ffffff" }}>
      <h1>Insights (Coming Soon)</h1>
    </div>
  );
}

export default function App() {
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "linear-gradient(to bottom, #083A42, #0B5563)",
        position: "relative",
      }}
    >
      {/* ROUTES */}
      <Routes>
        {/* LANDING — NO SIDEBAR */}
        <Route path="/" element={<Landing />} />

        {/* APP — WITH SIDEBAR */}
        <Route
          path="/*"
          element={
            <>
              <Sidebar />
              <main
                style={{
                  height: "100%",
                  width: "100%",
                  overflow: "hidden",
                }}
              >
                <Routes>
                  <Route path="analyze" element={<Analyzer />} />
                  <Route path="map" element={<RiskMap />} />
                  <Route path="insights" element={<Insights />} />
                </Routes>
              </main>
            </>
          }
        />
      </Routes>
    </div>
  );
}
