import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { useEffect, useState } from "react";

const center = [22.5726, 88.3639]; // Kolkata center

const RISK_COLORS = {
  "No Risk": "#22c55e",
  "Low Risk": "#facc15",
  "Medium Risk": "#fb923c",
  "High Risk": "#ef4444",
};

export default function FloodMap({ selectedGridId, riskLevel, confidence }) {
  const [gridData, setGridData] = useState(null);

  useEffect(() => {
    fetch("/kolkata_grid.geojson")
      .then((res) => res.json())
      .then(setGridData);
  }, []);

  const styleGrid = (feature) => {
    const gridId = feature.properties.grid_id;

    // Default: muted grey
    if (gridId !== selectedGridId) {
      return {
        color: "#475569",
        weight: 0.5,
        fillOpacity: 0.15,
        fillColor: "#334155",
      };
    }

    // Highlight selected grid
    return {
      color: "#000000",
      weight: 2,
      fillOpacity: 0.75,
      fillColor: RISK_COLORS[riskLevel] || "#999",
    };
  };

  const onEachGrid = (feature, layer) => {
    if (feature.properties.grid_id === selectedGridId) {
      layer.bindPopup(`
        <b>Flood Risk</b><br/>
        Risk Level: ${riskLevel}<br/>
        Confidence: ${(confidence * 100).toFixed(1)}%<br/>
        Grid ID: ${selectedGridId}
      `);
    }
  };

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "420px", width: "100%", borderRadius: "14px" }}
    >
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {gridData && (
        <GeoJSON
          data={gridData}
          style={styleGrid}
          onEachFeature={onEachGrid}
        />
      )}
    </MapContainer>
  );
}
