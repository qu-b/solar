import requests
from flask import jsonify
import os

API_KEY = os.environ.get('GOOGLE_MAPS_API_KEY')

def fetch_geocode_data(address=None, latitude=None, longitude=None):
    if address:
        url = f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={API_KEY}'
    elif latitude and longitude:
        url = f'https://maps.googleapis.com/maps/api/geocode/json?latlng={latitude},{longitude}&key={API_KEY}'
    else:
        return None

    response = requests.get(url).json()
    return response


def handle_geocode(address):
    response = fetch_geocode_data(address=address)

    if response and response['status'] == 'OK':
        location = response['results'][0]['geometry']['location']
        latitude, longitude = location['lat'], location['lng']
        return jsonify({'latitude': latitude, 'longitude': longitude})
    else:
        return jsonify({'error': 'Geocoding failed'}), 400


def handle_reverse_geocode(latitude, longitude):
    response = fetch_geocode_data(latitude=latitude, longitude=longitude)

    if response and response['status'] == 'OK':
        address = response['results'][0]['formatted_address']
        return jsonify({'address': address})
    else:
        return jsonify({'error': 'Reverse geocoding failed'}), 400
