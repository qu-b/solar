from sqlalchemy import func
from geoalchemy2.functions import ST_DWithin, ST_SetSRID, ST_MakePoint, ST_AsGeoJSON
import folium
import json
from solardata import SolkatChDach
import sqlalchemy


def fetch_roof_data(db_session, latitude, longitude, distance_in_meters=100):
    # Convert WGS 84 coordinates to the Swiss coordinate system
    transformed_point = func.ST_Transform(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),  # WGS 84
        2056  # Swiss coordinate system
    )

    # Query the database to get transformed geometries and stromertrag
    query = (db_session.query(
        func.ST_AsGeoJSON(func.ST_Transform(
            SolkatChDach.geom, 4326)),  # Transform to WGS84
        SolkatChDach.stromertrag)
        .filter(ST_DWithin(SolkatChDach.geom, transformed_point, distance_in_meters)))

    results = query.all()

    # Debugging: print the columns and their values for the first row
    if results:
        print("Type of first element:", type(results[0]))
        first_row = results[0]
        if isinstance(first_row, sqlalchemy.engine.row.Row):
            row_dict = first_row._asdict()
            for column, value in row_dict.items():
                print(f"{column}: {value}")
        else:
            print(f"Unexpected type for the first row: {type(first_row)}")

    # Construct the GeoJSON object
    geojson_data = []
    for row in results:
        # Parse the GeoJSON string to a Python dict
        geom_geojson = json.loads(row[0])
        geojson_data.append({
            "type": "Feature",
            "properties": {"stromertrag": row[1]},
            # This should now be a Python dictionary representing the GeoJSON geometry
            "geometry": geom_geojson
        })

    return {
        "type": "FeatureCollection",
        "features": geojson_data
    }


def get_color(stromertrag):
    if stromertrag < 500:
        return 'red'
    elif 500 <= stromertrag < 1000:
        return 'orange'
    else:
        return 'green'


def generate_folium_map(db_session, latitude, longitude):
    # Fetch the roof data in GeoJSON format
    geojson_data = fetch_roof_data(db_session, latitude, longitude)

    # Create a Folium map centered at the given latitude and longitude
    map_instance = folium.Map(location=[latitude, longitude], zoom_start=25)

    # Add the GeoJSON data to the map
    folium.GeoJson(
        geojson_data,
        style_function=lambda feature: {
            'fillColor': get_color(feature['properties']['stromertrag']),
            'color': get_color(feature['properties']['stromertrag']),
            'weight': 1
        }
    ).add_to(map_instance)

    return map_instance
