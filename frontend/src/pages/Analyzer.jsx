import { useState, useEffect, useRef } from "react";

const API_BASE = "http://127.0.0.1:8000";
const SIDEBAR_WIDTH = 96;
const LOADER_DURATION = 3000; // 1.5s × 2

export default function Analyzer() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false); // ✅ ADDED
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  /* ---------- AUTOCOMPLETE ---------- */
  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const t = setTimeout(() => {
      fetch(`${API_BASE}/geocode?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (place) => {
    setQuery(place.name);
    setSelected(place);
    setSuggestions([]);
  };

  /* ---------- ANALYZE ---------- */
  const analyzeRisk = async () => {
    if (!selected) return;

    setLoading(true);
    setShowResult(false); // ✅ ADDED
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: selected.lat,
          longitude: selected.lon
        })
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setResult(data);

      // ✅ wait for loader to play twice
      setTimeout(() => {
        setLoading(false);
        setShowResult(true);
      }, LOADER_DURATION);

    } catch {
      setLoading(false);
      setError("Could not analyze flood risk");
    }
  };

  const riskLabel =
    result?.risk_label ||
    result?.risk ||
    result?.risk_level ||
    result?.prediction ||
    "Unknown";

  return (
  <>
    <div className="background--custom"></div>

    <div style={styles.shell}>

      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src="/Flood_icon.png"
            alt="Flood Icon"
            style={styles.icon}
         />
        <h1 style={styles.title}>Flood Risk Analyzer</h1>
    </div>


        {/* SEARCH BAR — UNCHANGED */}
        <div
          style={styles.searchWrapper}
          onMouseEnter={() => {
            if (!open) setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 200);
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className={`searchfield ${open ? "open" : ""}`}
            value={query}
            placeholder="Search location"
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
          />

          <div
            className="search"
            onClick={() => {
              if (!open) {
                setOpen(true);
                setTimeout(() => inputRef.current?.focus(), 200);
              } else {
                setOpen(false);
              }
            }}
          />
        </div>

        {open && suggestions.length > 0 && (
          <div style={styles.dropdown}>
            {suggestions.map((p, i) => (
              <div
                key={i}
                style={styles.option}
                onClick={() => handleSelect(p)}
              >
                {p.name}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={analyzeRisk}
          disabled={!selected || loading}
          style={{
            ...styles.button,
            opacity: !selected || loading ? 0.6 : 1
          }}
        >
          Analyze Flood Risk
        </button>

        {/* 🔄 LOADER (CENTERED) — ADDED */}
        {loading && (
          <div style={{ marginTop: "36px", display: "flex", justifyContent: "center" }}>
            <div className="loader"></div>
          </div>
        )}

        {/* ✅ RESULT AFTER LOADER */}
        {showResult && result && (
  <div className={`risk-card ${riskLabel.toLowerCase()}`}>
    <div className="risk-title">Flood Risk Level</div>
    <div className="risk-value">{riskLabel}</div>
  </div>
)}


        {error && <p style={styles.error}>{error}</p>}
      </div>

      {/* 🔒 EXISTING SEARCH CSS — UNCHANGED */}
      <style>
        
        
        {`
        /* =========================
   RISK RESULT CARD
========================= */
.risk-card {
  margin-top: 36px;
  padding: 22px 30px;
  min-width: 320px;

  background: rgba(255, 255, 255, 0.94);
  border-radius: 18px;

  box-shadow:
    0 14px 36px rgba(0, 0, 0, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);

  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  border-left: 8px solid transparent;

  text-align: center;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.risk-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.75);
}

.risk-title {
  font-size: 0.85rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #5f6f73;
  margin-bottom: 6px;
}

.risk-value {
  font-size: 2.1rem;
  font-weight: 700;
}

/* =========================
   COLOR STATES
========================= */

/* LOW → GREEN */
.risk-card.low {
  border-left-color: #22c55e;
}
.risk-card.low .risk-value {
  color: #22c55e;
}

/* MEDIUM → YELLOW */
.risk-card.medium {
  border-left-color: #facc15;
}
.risk-card.medium .risk-value {
  color: #ca8a04;
}

/* HIGH → RED */
.risk-card.high {
  border-left-color: #ef4444;
}
.risk-card.high .risk-value {
  color: #dc2626;
}

        html, body {
  width: 100%;
  height: 100%;
}
  .background--custom {
  position: fixed;
  inset: 0;
  z-index: 0;

  background: linear-gradient(
    135deg,
    #2b81beff,
    #0F4C58,
    #33667091
  );
  background-size: 500% 500%;
  animation: ocean 6s ease-in-out infinite;
}

@keyframes ocean {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}



@keyframes gradient {
  0% {
    background-position: 0%;
  }
  100% {
    background-position: 100%;
  }
}




        .searchfield {
          position: absolute;
          margin: auto;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 50px;
          outline: none;
          border: none;
          background: #fff;
          color: #111;
          padding: 0 80px 0 20px;
          border-radius: 30px;
          box-shadow: 12px 13px 25px 0 #111,
                      8px 9px 25px 0 rgba(0,0,0,.2);
          transition: all 1s;
          opacity: 0;
          z-index: 5;
          font-weight: 600;
          letter-spacing: 0.1em;
        }

        .searchfield.open {
          width: 300px;
          opacity: 1;
        }

        .search {
          position: absolute;
          margin: auto;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 50px;
          background: #fff;
          border-radius: 50%;
          transition: all 1s;
          z-index: 6;
          cursor: pointer;
        }

        .search::before {
          content: "";
          position: absolute;
          margin: auto;
          top: 10px;
          right: 8px;
          bottom: -5px;
          left: 22px;
          width: 12px;
          height: 2px;
          background-color: #111;
          transform: rotate(45deg);
        }

        .search::after {
          content: "";
          position: absolute;
          margin: auto;
          top: -5px;
          right: 0;
          bottom: 0;
          left: -5px;
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 2px solid #111;
        }

        .searchfield.open ~ .search {
          right: -240px;
          background: transparent;
        }

        .searchfield.open ~ .search::before {
          content: "";
          position: absolute;
          margin: auto;
          top: 0;
          bottom: 0;
          left: 12px;
          right: 0;
          width: 25px;
          height: 2px;
          background: #111;
          transform: rotate(45deg);
        }

        .searchfield.open ~ .search::after {
          content: "";
          position: absolute;
          margin: auto;
          top: 0;
          bottom: 0;
          left: 12px;
          right: 0;
          width: 25px;
          height: 2px;
          background: #111;
          transform: rotate(-45deg);
          border: none;
          border-radius: 0;
        }

        /* 🔄 LOADER CSS — ADDED */
        .loader {
          width: 40px;
          height: 20px;
          --c:no-repeat radial-gradient(farthest-side,#fff 93%,#0000);
          background:
            var(--c) 0    0,
            var(--c) 50%  0;
          background-size: 8px 8px;
          position: relative;
          clip-path: inset(-200% -100% 0 0);
          animation: l6-0 1.5s linear infinite;
        }
        .loader:before {
          content: "";
          position: absolute;
          width: 8px;
          height: 12px;
          background: #fff;
          left: -16px;
          top: 0;
          animation: 
            l6-1 1.5s linear infinite,
            l6-2 0.5s cubic-bezier(0,200,.8,200) infinite;
        }
        .loader:after {
          content: "";
          position: absolute;
          inset: 0 0 auto auto;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff; 
          animation: l6-3 1.5s linear infinite;
        }
        @keyframes l6-0 {
          0%,30%  {background-position: 0  0   ,50% 0   }
          33%     {background-position: 0  100%,50% 0   }
          41%,63% {background-position: 0  0   ,50% 0   }
          66%     {background-position: 0  0   ,50% 100%}
          74%,100%{background-position: 0  0   ,50% 0   }
        }
        @keyframes l6-1 {
          90%  {transform:translateY(0)}
          95%  {transform:translateY(15px)}
          100% {transform:translateY(15px);left:calc(100% - 8px)}
        }
        @keyframes l6-2 {
          100% {top:-0.1px}
        }
        @keyframes l6-3 {
          0%,80%,100% {transform:translate(0)}
          90%         {transform:translate(26px)}
        }
        `}
      </style>
    </div>
    </>
  );

}

/* ===== layout untouched ===== */

const styles = {
  shell: {
  marginLeft: `${SIDEBAR_WIDTH}px`,
  width: `calc(100vw - ${SIDEBAR_WIDTH}px)`,
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
zIndex: 1,


  
},
header: {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: "48px"
},

icon: {
  width: "56px",
  height: "56px",
  marginBottom: "12px"
},

  card: {
    maxWidth: "520px",
    width: "100%",
    textAlign: "center",
    color: "#e6f1f3"
  },
  title: {
    marginBottom: "48px",
    color: "#ffffff"
  },
  searchWrapper: {
    position: "relative",
    height: "50px",
    marginBottom: "28px"
  },
  dropdown: {
    marginTop: "12px",
    background: "#0f3f47",
    borderRadius: "14px",
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
    overflow: "hidden"
  },
  option: {
    padding: "14px 18px",
    cursor: "pointer",
    color: "#e6f1f3",
    borderBottom: "1px solid rgba(255,255,255,0.08)"
  },
  button: {
    marginTop: "26px",
    padding: "14px 32px",
    fontSize: "16px",
    borderRadius: "30px",
    border: "none",
    cursor: "pointer",
    background: "#1d9bf0",
    color: "#ffffff",
    fontWeight: 600,
    boxShadow: "0 12px 30px rgba(0,0,0,0.35)"
  },
  resultCard: {
    marginTop: "36px",
    padding: "22px",
    borderRadius: "16px",
    background: "#eaf4f6",
    color: "#0b2c35",
    textAlign: "left"
  },
  error: {
    marginTop: "20px",
    color: "#ff6b6b"
  }
};
