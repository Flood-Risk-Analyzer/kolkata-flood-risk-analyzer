import { useEffect, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE = "http://127.0.0.1:8000";

function FitBounds({ data }) {
  const map = useMap();

  useEffect(() => {
    if (!data) return;
    const layer = window.L.geoJSON(data);
    map.fitBounds(layer.getBounds());
  }, [data, map]);

  return null;
}

export default function RiskMap() {
  const [geoData, setGeoData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/map`)
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch((err) => console.error("GeoJSON load failed", err));
  }, []);

  const styleFeature = (feature) => {
    const risk = feature.properties?.risk || "No";

    const colors = {
      No: "#9ca3af",
      Low: "#4ade80",
      Medium: "#facc15",
      High: "#f87171",
    };

    return {
      fillColor: colors[risk],
      weight: 1,
      color: "#111",
      fillOpacity: 0.6,
    };
  };

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <MapContainer
        center={[22.5726, 88.3639]}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {geoData && (
          <>
            <FitBounds data={geoData} />
            <GeoJSON data={geoData} style={styleFeature} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
