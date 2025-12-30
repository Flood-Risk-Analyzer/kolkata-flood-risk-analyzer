from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from app.risk_map import generate_risk_map
from app.schemas import LocationRequest, LocationNameRequest
from app.geocode import geocode_place
from app.spatial_utils import latlon_to_grid
from app.weather import fetch_weather_features
from app.model_loader import predict_risk

# -------------------------------------------------
# App setup
# -------------------------------------------------
app = FastAPI(title="Kolkata Flood Risk API")

# -------------------------------------------------
# CORS (for React frontend)
# -------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for local + hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# Health check
# -------------------------------------------------
@app.get("/")
def root():
    return {"message": "Flood Risk API running"}

# -------------------------------------------------
# 🔍 Geocode (AUTOCOMPLETE)
# -------------------------------------------------
@app.get("/geocode")
def geocode(q: str = Query(..., min_length=3)):
    """
    Returns location suggestions with lat/lon
    Used by frontend autocomplete
    """
    results = geocode_place(q)

    if not results:
        return []

    return results

# -------------------------------------------------
# Predict by LAT / LON (GPS)
# -------------------------------------------------
@app.post("/predict")
def predict(location: LocationRequest):
    # 1️⃣ Map lat/lon → grid
    grid_id = latlon_to_grid(location.latitude, location.longitude)

    # ❌ Outside grid → STOP
    if grid_id is None:
        raise HTTPException(
            status_code=404,
            detail="Location is outside flood prediction coverage"
        )

    # 2️⃣ Fetch live weather features
    weather = fetch_weather_features(
        location.latitude,
        location.longitude
    )

    # 3️⃣ Build feature vector (must match training)
    features = {
        # Weather
        "rainfall_mm": weather["rainfall_mm"],
        "rain_3d_sum": weather["rain_3d_sum"],
        "rain_7d_sum": weather["rain_7d_sum"],
        "rain_14d_sum": weather["rain_14d_sum"],
        "rain_intensity": weather["rain_intensity"],

        # Spatial (static / derived in training)
        "dist_to_water_m": 300,
        "waterway_count": 3,
        "mean_elevation": -44,
        "elevation_range": 8,
        "log_population": 0.23,

        # Interaction terms
        "rain_x_pop": weather["rainfall_mm"] * 0.23,
        "rain_x_elev_range": weather["rainfall_mm"] * 8,
    }

    # 4️⃣ Model prediction
    prediction = predict_risk(features)

    # 5️⃣ Attach metadata
    prediction["grid_id"] = int(grid_id)
    prediction["weather_used"] = weather

    return prediction

# -------------------------------------------------
# Predict by PLACE NAME (simple text submit)
# -------------------------------------------------
@app.post("/predict-by-name")
def predict_by_name(payload: LocationNameRequest):
    # 1️⃣ Geocode place name
    results = geocode_place(payload.place)

    if not results:
        raise HTTPException(
            status_code=404,
            detail="Location not found"
        )

    # 2️⃣ Use best match (first result)
    geo = results[0]

    location = LocationRequest(
        latitude=geo["lat"],
        longitude=geo["lon"]
    )

    return predict(location)
@app.get("/map")
def map_endpoint():
    return generate_risk_map()


#uvicorn app.main:app --reload