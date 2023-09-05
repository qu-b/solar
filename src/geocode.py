import requests
import folium
from flask import jsonify

# AIzaSyAc_eJ1jZXZT1JGIV48S2FYcJCS2MlnU4E


def fetch_geocode_data(address):
    api_key = 'AIzaSyAc_eJ1jZXZT1JGIV48S2FYcJCS2MlnU4E'
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={api_key}'
    response = requests.get(url).json()
    return response


def create_folium_map(latitude, longitude, address, geojson_data):
    map = folium.Map(location=[latitude, longitude], zoom_start=18)

    # Convert the GeoJSON data to a dictionary
    geojson_dict = geojson_data

    # Create a GeoJson layer for the roof polygons and add it to the map
    folium.GeoJson(geojson_dict, name="Roof Polygons").add_to(map)

    # Create a marker for the user's location and add it to the map
    folium.Marker([latitude, longitude], popup=address).add_to(map)

    # Save the map as an HTML file
    map.save('templates/map.html')


def handle_geocode(address, geojson_data):
    response = fetch_geocode_data(address)

    if response['status'] == 'OK':
        location = response['results'][0]['geometry']['location']
        latitude = location['lat']
        longitude = location['lng']

        create_folium_map(latitude, longitude, address, geojson_data)

        return jsonify({'latitude': latitude, 'longitude': longitude})
    else:
        return jsonify({'error': 'Geocoding failed'})
