from flask import Flask, jsonify, request, render_template, send_file
from flask_sqlalchemy import SQLAlchemy
from geocode import handle_geocode, handle_reverse_geocode
from solar_calculations import calculate_solar_energy
from generate_map import generate_folium_map, fetch_roof_data, assign_colors
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__,
            template_folder=os.path.join(os.path.dirname(__file__), 'templates'),
            static_folder=os.path.join(os.path.dirname(__file__), 'static'))
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://solar:solar@localhost/solardb'
db = SQLAlchemy(app)


@app.route('/')
def calculator():
    return render_template('index.html')


@app.route('/data/<filename>')
def serve_geojson(filename):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'data', filename)
    return send_file(file_path, as_attachment=True)


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    installation_size = data.get('installation_size') or 0
    solar_radiation = data.get('solar_radiation') or 0
    energy_output = calculate_solar_energy(installation_size, solar_radiation)
    return jsonify({"energy_output": energy_output})


@app.route('/dynamic_map')
def dynamic_map():
    latitude = float(request.args.get('latitude', 46.9465))
    longitude = float(request.args.get('longitude', 7.4440))
    map_instance = generate_folium_map(db.session, latitude, longitude)
    return map_instance._repr_html_()


@app.route('/geocode', methods=['POST'])
def geocode():
    data = request.json

    if 'address' in data:
        return handle_geocode(data['address'])
    elif 'latitude' in data and 'longitude' in data:
        return handle_reverse_geocode(data['latitude'], data['longitude'])
    else:
        return jsonify({'error': 'Invalid parameters'}), 400


@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    query = request.json.get('query', '')
    api_key = os.environ.get('GOOGLE_MAPS_API_KEY')
    response = requests.get(
        f"https://maps.googleapis.com/maps/api/place/autocomplete/json?input={query}&types=address&components=country:ch&key={api_key}"
    )
    suggestions = response.json().get('predictions', [])
    suggestions_list = [{"description": s["description"],
                         "id": s["place_id"]} for s in suggestions]
    return jsonify(suggestions_list)


@app.route('/geojson_data')
def geojson_data():
    latitude = request.args.get('latitude', type=float, default=46.9465)
    longitude = request.args.get('longitude', type=float, default=7.4440)
    geojson_data = fetch_roof_data(db.session, latitude, longitude)
    polygons = assign_colors(geojson_data.get('features', []))
    return jsonify(geojson_data)


if __name__ == '__main__':
    app.run(debug=True)
