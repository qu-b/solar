import json
from sqlalchemy import create_engine, func
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from geoalchemy2.shape import to_shape
import folium  # For rendering maps
from solardata import SolkatChDach
from geoalchemy2.functions import ST_DWithin, ST_SetSRID, ST_MakePoint, ST_AsGeoJSON
from sqlalchemy import func
import sqlalchemy


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost/solardb'
# Optional; suppresses a warning if not set
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


def fetch_roof_data(latitude, longitude, distance_in_meters=100):
    # Convert WGS 84 coordinates to the Swiss coordinate system
    transformed_point = func.ST_Transform(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),  # WGS 84
        2056  # Swiss coordinate system
    )

    # Query the database to get transformed geometries and stromertrag
    query = (db.session.query(
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


# Use the function to fetch data and display the map
with app.app_context():
    latitude, longitude = 46.9465, 7.4440  # Example coordinates
    geojson_data = fetch_roof_data(latitude, longitude)

    # Create a Folium map
    m = folium.Map(location=[latitude, longitude], zoom_start=25)

    # Add GeoJSON to Folium map
    folium.GeoJson(geojson_data).add_to(m)

    # Save the map to an HTML file
    m.save('map.html')
