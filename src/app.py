import requests
import geopandas as gpd
from flask import Flask, jsonify, request, render_template
import folium
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from geoalchemy2.shape import to_shape


# Database configuration
DATABASE_URL = "postgresql://Francis:Hkylife6!@localhost/solardb"
engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()


app = Flask(__name__, static_folder='../static',
            template_folder='../templates')


# Function to perform the solar energy calculation
def calculate_solar_energy(installation_size, solar_radiation, panel_efficiency=0.18):
    return installation_size * solar_radiation * panel_efficiency


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    installation_size = data.get('installation_size', 0)
    solar_radiation = data.get('solar_radiation', 0)

    # Perform calculation
    energy_output = calculate_solar_energy(installation_size, solar_radiation)
    return jsonify({"energy_output": energy_output})


@app.route('/')
def calculator():
    return render_template('index.html')

# AIzaSyAc_eJ1jZXZT1JGIV48S2FYcJCS2MlnU4E


@app.route('/geocode', methods=['GET', 'POST'])
def geocode():
    if request.method == 'POST':
        address = request.form.get('address')

        # Call the Google Geocoding API
        api_key = 'AIzaSyAc_eJ1jZXZT1JGIV48S2FYcJCS2MlnU4E'
        url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}'
        response = requests.get(url).json()

        if response['status'] == 'OK':
            location = response['results'][0]['geometry']['location']
            latitude = location['lat']
            longitude = location['lng']

            # Fetch GeoJSON data for roof polygons from the PostGIS database
            query = "SELECT * FROM roofs"
            result = engine.execute(query)

            # Create a Folium map centered at the user's location
            map = folium.Map(location=[latitude, longitude], zoom_start=18)

            # Convert the database result to GeoJSON format
            geojson_data = {
                "type": "FeatureCollection",
                "features": []
            }
            for row in result:
                geometry = to_shape(row['geometry'])
                properties = {key: row[key]
                              for key in row.keys() if key != 'geometry'}
                feature = {
                    "type": "Feature",
                    "geometry": geometry.__geo_interface__,
                    "properties": properties
                }
                geojson_data["features"].append(feature)

            # Create a GeoJSON layer for the roof polygons and add it to the map
            folium.GeoJson(geojson_data, name="Roof Polygons").add_to(map)

            # Create a marker for the user's location and add it to the map
            folium.Marker([latitude, longitude], popup=address).add_to(map)

            # Save the map as an HTML file
            map.save('templates/map.html')

            return render_template('index.html')
        else:
            return jsonify({'error': 'Geocoding failed'})

    return render_template('index.html')  # For GET requests


if __name__ == '__main__':
    app.run(debug=True)
