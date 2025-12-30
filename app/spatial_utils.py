import geopandas as gpd
from shapely.geometry import Point

# -------------------------------------------------
# Load Kolkata grid
# -------------------------------------------------
GRID_PATH = "data/kolkata_grid.geojson"

grid = gpd.read_file(GRID_PATH)

# Ensure CRS is lat/lon
if grid.crs is None or grid.crs.to_string() != "EPSG:4326":
    grid = grid.to_crs("EPSG:4326")


# -------------------------------------------------
# Convert lat/lon → grid_id (STRICT)
# -------------------------------------------------
def latlon_to_grid(lat: float, lon: float):
    """
    Returns grid_id ONLY if the point lies inside the grid.
    Otherwise returns None.
    """

    point = Point(lon, lat)

    # Use covers instead of contains (handles boundaries safely)
    matches = grid[grid.geometry.covers(point)]

    if len(matches) == 0:
        return None

    return int(matches.iloc[0]["grid_id"])
