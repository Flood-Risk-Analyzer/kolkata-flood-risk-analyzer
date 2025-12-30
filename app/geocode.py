import requests

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Kolkata bounding box (lon_min, lat_min, lon_max, lat_max)
KOLKATA_BBOX = "88.25,22.45,88.45,22.70"

HEADERS = {
    "User-Agent": "Kolkata-Flood-Risk-App/1.0 (student project)"
}

def geocode_place(place: str):
    params = {
        "q": f"{place}, Kolkata, India",
        "format": "json",
        "limit": 5,
        "viewbox": KOLKATA_BBOX,
        "bounded": 1
    }

    try:
        res = requests.get(
            NOMINATIM_URL,
            params=params,
            headers=HEADERS,
            timeout=10
        )
        res.raise_for_status()
        data = res.json()

        if not data:
            return []

        return [
            {
                "name": item["display_name"],
                "lat": float(item["lat"]),
                "lon": float(item["lon"])
            }
            for item in data
        ]

    except Exception as e:
        print("Geocoding error:", e)
        return []
