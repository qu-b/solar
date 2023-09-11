import requests
from flask import jsonify


API_KEY = 'AIzaSyAc_eJ1jZXZT1JGIV48S2FYcJCS2MlnU4E'


def fetch_geocode_data(address):
    url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}'
    response = requests.get(url).json()
    return response


def handle_geocode(address):
    response = fetch_geocode_data(address)

    if response['status'] == 'OK':
        location = response['results'][0]['geometry']['location']
        latitude, longitude = location['lat'], location['lng']
        return jsonify({'latitude': latitude, 'longitude': longitude})
    else:
        return jsonify({'error': 'Geocoding failed'})
