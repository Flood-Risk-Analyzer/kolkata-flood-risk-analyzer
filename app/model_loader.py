import pickle
import numpy as np

# -----------------------
# Load model artifacts
# -----------------------
with open("model/kolkata_flood_risk_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("model/model_features.pkl", "rb") as f:
    FEATURES = pickle.load(f)

with open("model/risk_thresholds.pkl", "rb") as f:
    RISK_THRESHOLDS = pickle.load(f)


# -----------------------
# Prediction function
# -----------------------
def predict_risk(features: dict):
    """
    features: dict with keys matching FEATURES list
    """

    # Ensure correct feature order
    X = np.array([[float(features[f]) for f in FEATURES]])

    # Predict probabilities
    probs = model.predict_proba(X)[0]

    # Class index with highest probability
    class_idx = int(np.argmax(probs))

    risk_levels = ["No Risk", "Low", "Medium", "High"]

    return {
        "risk_level": risk_levels[class_idx],
        "confidence": float(probs[class_idx]),
    }
