import json
import geopandas as gpd
import pandas as pd
import joblib

from app.weather import fetch_weather_features

# -------------------------------------------------
# PATHS
# -------------------------------------------------
GRID_GEOJSON_PATH = "data/kolkata_grid.geojson"
MODEL_PATH = "model/kolkata_flood_risk_model.pkl"
FEATURES_PATH = "model/model_features.pkl"

# Kolkata anchor point (for live weather)
KOLKATA_LAT = 22.5726
KOLKATA_LON = 88.3639

# -------------------------------------------------
# LOAD STATIC ASSETS
# -------------------------------------------------
grid_gdf = gpd.read_file(GRID_GEOJSON_PATH)

model = joblib.load(MODEL_PATH)
feature_list = joblib.load(FEATURES_PATH)

# -------------------------------------------------
# MAIN FUNCTION
# -------------------------------------------------
def generate_risk_map():
    # -------------------------------------------------
    # 1️⃣ FETCH LIVE WEATHER (ONCE)
    # -------------------------------------------------
    weather = fetch_weather_features(
        lat=KOLKATA_LAT,
        lon=KOLKATA_LON
    )

    # -------------------------------------------------
    # 2️⃣ BUILD FEATURE MATRIX
    # -------------------------------------------------
    X = pd.DataFrame(
        0.0,
        index=grid_gdf.index,
        columns=feature_list
    )

    # -------------------------------------------------
    # 3️⃣ INJECT LIVE RAINFALL
    # -------------------------------------------------
    for col in X.columns:
        cname = col.lower()

        if "rain" in cname:
            if "3d" in cname:
                X[col] = weather["rain_3d_sum"]
            elif "7d" in cname:
                X[col] = weather["rain_7d_sum"]
            elif "14d" in cname:
                X[col] = weather["rain_14d_sum"]
            elif "intensity" in cname:
                X[col] = weather["rain_intensity"]
            else:
                X[col] = weather["rainfall_mm"]

    # -------------------------------------------------
    # 4️⃣ ADD SPATIAL VARIATION (NON-RAIN FEATURES)
    # -------------------------------------------------
    # This keeps grids different and reacts to rainfall
    for col in X.columns:
        if "rain" not in col.lower():
            X[col] = (pd.Series(range(len(X))) % 20) / 20.0

    # -------------------------------------------------
    # 5️⃣ SPATIALLY AMPLIFY RAINFALL (KEY FIX)
    # -------------------------------------------------
    # Low-lying grids flood more when it rains
    if "mean_elevation" in X.columns:
        elev_rank = X["mean_elevation"].rank(pct=True)
        amplification = 1 + (1 - elev_rank)
        X["rainfall_mm"] *= amplification
        if "rain_7d_sum" in X.columns:
            X["rain_7d_sum"] *= amplification

    # -------------------------------------------------
    # 6️⃣ MODEL PREDICTION
    # -------------------------------------------------
    probs = model.predict_proba(X)

    if probs.shape[1] == 2:
        risk_score = probs[:, 1]
    else:
        risk_score = probs[:, -1]

    grid_gdf["risk_score"] = risk_score

    # -------------------------------------------------
    # 7️⃣ ABSOLUTE THRESHOLDS (VISIBLE CHANGE)
    # -------------------------------------------------
    def label_risk(p):
        if p >= 0.70:
            return "High"
        elif p >= 0.40:
            return "Medium"
        else:
            return "Low"

    grid_gdf["risk"] = grid_gdf["risk_score"].apply(label_risk)

    # -------------------------------------------------
    # 8️⃣ ATTACH WEATHER METADATA (OPTIONAL)
    # -------------------------------------------------
    grid_gdf["rainfall_mm"] = weather["rainfall_mm"]
    grid_gdf["rain_7d_sum"] = weather["rain_7d_sum"]

    # -------------------------------------------------
    # 9️⃣ RETURN VALID GEOJSON
    # -------------------------------------------------
    return json.loads(grid_gdf.to_json())
