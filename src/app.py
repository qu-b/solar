from flask import Flask, jsonify, request, render_template, Response
from flask_sqlalchemy import SQLAlchemy
from solardata import SolkatChDach
from geocode import handle_geocode
from solar_calculations import calculate_solar_energy
from generate_map import fetch_roof_data, generate_folium_map
import folium

app = Flask(__name__, template_folder='/Users/Francis/Documents/Dev/Apps/solaire/templates',
            static_folder='/Users/Francis/Documents/Dev/Apps/solaire/static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:1234@localhost/solardb'
db = SQLAlchemy(app)


@app.route('/')
def calculator():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    installation_size = data.get('installation_size', 0)
    solar_radiation = data.get('solar_radiation', 0)
    energy_output = calculate_solar_energy(installation_size, solar_radiation)
    return jsonify({"energy_output": energy_output})


@app.route('/dynamic_map')
def dynamic_map():
    latitude = float(request.args.get('latitude', 46.9465))
    longitude = float(request.args.get('longitude', 7.4440))
    map_instance = generate_folium_map(db.session, latitude, longitude)
    return map_instance._repr_html_()


@app.route('/geocode', methods=['POST'])
def geocode_route():
    address = request.json.get('address')
    response = handle_geocode(address)
    if 'error' in response.json:
        return response
    latitude = response.json['latitude']
    longitude = response.json['longitude']
    return jsonify({"latitude": latitude, "longitude": longitude})


if __name__ == '__main__':
    app.run(debug=True)
