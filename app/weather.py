import os
import requests
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENWEATHER_API_KEY")
BASE_URL = "https://api.openweathermap.org/data/2.5/forecast"


def fetch_weather_features(lat: float, lon: float) -> dict:
    """
    Fetch rainfall features using OpenWeather 5-day / 3-hour forecast API
    """

    if not API_KEY:
        raise RuntimeError("OPENWEATHER_API_KEY not found in environment")

    params = {
        "lat": lat,
        "lon": lon,
        "appid": API_KEY,
        "units": "metric",
    }

    response = requests.get(BASE_URL, params=params, timeout=10)
    response.raise_for_status()
    data = response.json()

    forecasts = data.get("list", [])

    # Extract 3-hour rainfall values
    rain_3h = [
        item.get("rain", {}).get("3h", 0.0)
        for item in forecasts
    ]

    rainfall_mm = rain_3h[0] if rain_3h else 0.0
    rain_3d_sum = sum(rain_3h[:24])        # 3 days
    rain_7d_sum = sum(rain_3h)             # approx (5 days max)
    rain_14d_sum = rain_7d_sum              # fallback
    rain_intensity = max(rain_3h[:8], default=0.0)  # last 24h peak

    return {
        "rainfall_mm": rainfall_mm,
        "rain_3d_sum": rain_3d_sum,
        "rain_7d_sum": rain_7d_sum,
        "rain_14d_sum": rain_14d_sum,
        "rain_intensity": rain_intensity,
    }
