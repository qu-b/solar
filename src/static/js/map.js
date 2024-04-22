// Constants
const DEFAULT_LATITUDE = 46.800059446787316;
const DEFAULT_LONGITUDE = 8.037623529225266;
const MAP_ELEMENT_ID = 'leaflet-map';
const WMS_URL = "https://wms.geo.admin.ch/";
const SWISSIMAGE_LAYER = 'ch.swisstopo.swissimage';
const NOT_YET_LOCALIZED_TEXT_ID = 'notyetlocalized-text';

class MapHandler {
	constructor() {
		this.map = null;
		this.geoJsonLayer = null;
		this.switzerlandLayer = null;
		this.marker = null;
		this.cache = {};
	}

	async initializeMap(latitude = DEFAULT_LATITUDE, longitude = DEFAULT_LONGITUDE) {
		this.createMap(latitude, longitude);
		this.addBaseLayer();
		this.displayNotLocalizedText();
		this.addSwitzerlandLayer();
		this.addEventListeners();
	}

	createMap(latitude, longitude) {
		this.map = L.map(MAP_ELEMENT_ID).setView([latitude, longitude], 7);
	}

	addBaseLayer() {
		L.tileLayer.wms(WMS_URL, {
			layers: SWISSIMAGE_LAYER,
			format: 'image/jpeg',
			transparent: true,
			maxZoom: 24
		}).addTo(this.map);
	}

	displayNotLocalizedText() {
		document.getElementById(NOT_YET_LOCALIZED_TEXT_ID).style.display = 'block';
	}

	async addSwitzerlandLayer() {
		if (this.switzerlandLayer) return;
		const response = await fetch('/data/ch.geojson');
		const switzerlandGeoJSON = await response.json();
		this.switzerlandLayer = L.geoJSON(switzerlandGeoJSON, {
			style: this.getSwitzerlandLayerStyle()
		}).addTo(this.map);
	}

	getSwitzerlandLayerStyle() {
		return {
			fillColor: 'lightblue',
			fillOpacity: 0.5,
			color: '#3388ff',
			weight: 1
		};
	}

	removeSwitzerlandLayer() {
		if (!this.switzerlandLayer) return;
		this.map.removeLayer(this.switzerlandLayer);
		this.switzerlandLayer = null;
	}

	addEventListeners() {
		this.map.on('zoomend', this.handleZoomEnd.bind(this));
		this.map.on('moveend', this.handleMoveEnd.bind(this));
	}

	handleZoomEnd() {
		const zoomLevel = this.map.getZoom();
		if (zoomLevel > 12) {
			this.removeSwitzerlandLayer();
			if (this.marker) {
				this.map.removeLayer(this.marker);
			}
		}
		else if (zoomLevel > 15) {
			const center = this.map.getCenter();
			this.fetchAndRenderGeoJson(center.lat, center.lng);
		}
		else {
			this.addSwitzerlandLayer();
		}
	}

	handleMoveEnd() {
		const center = this.map.getCenter();
		this.fetchAndRenderGeoJson(center.lat, center.lng);
	}

	getBestPolygon(polygons, sb_uuid) {
		let bestPolygon = null;
		let maxRadiationArea = 0;

		polygons.forEach(polygon => {
			const { sb_uuid: currentSB_UUID, mstrahlung, flaeche } = polygon.properties;

			const currentRadiationArea = mstrahlung * flaeche;
			if (currentSB_UUID && sb_uuid && currentSB_UUID.trim() === sb_uuid.trim() && currentRadiationArea > maxRadiationArea) {
				bestPolygon = polygon;
				maxRadiationArea = currentRadiationArea;
			}
		});
		return bestPolygon;
	}

	updateSuitabilityBox(color) {
		const suitabilityBox = document.getElementById('suitability-box');
		const suitabilityValue = document.getElementById('suitability-value');

		// Determine the suitability level and apply corresponding class to the box
		let suitabilityLevel = 'Suitability: ...';
		if (color) {
			if (color === 'red') {
				suitabilityLevel = 'Excellent';
				suitabilityBox.className = 'info-box excellent';
			} else if (color === 'darkorange') {
				suitabilityLevel = 'Very High';
				suitabilityBox.className = 'info-box very-high';
			} else if (color === 'orange') {
				suitabilityLevel = 'High';
				suitabilityBox.className = 'info-box high';
			} else if (color === 'yellow') {
				suitabilityLevel = 'Medium';
				suitabilityBox.className = 'info-box medium';
			} else if (color === 'lightblue') {
				suitabilityLevel = 'Low';
				suitabilityBox.className = 'info-box low';
			}
		} else {
			suitabilityBox.className = 'info-box';
		}

		suitabilityValue.textContent = `Suitability: ${suitabilityLevel}`;
	}

	updateRoofData(properties) {
		let rawOrientation = properties.ausrichtung; // assuming ausrichtung can be negative
		let adjustedOrientation = 180 + rawOrientation;
		let direction = '';

		if (adjustedOrientation < 45) {
			direction = 'North';
		} else if (adjustedOrientation >= 45 && adjustedOrientation < 135) {
			direction = 'East';
		} else if (adjustedOrientation >= 135 && adjustedOrientation < 225) {
			direction = 'South';
		} else if (adjustedOrientation >= 225 && adjustedOrientation < 315) {
			direction = 'West';
		}
		else { direction = 'North' }

		// Update the HTML elements with the properties
		document.getElementById('roof-area').innerHTML = `${Math.floor(properties.flaeche)} m&sup2`;
		document.getElementById('roof-pitch').innerHTML = `${properties.neigung}°`;
		document.getElementById('orientation').innerHTML = `${adjustedOrientation}° ${direction}`;
		document.getElementById('solar-radiation').innerHTML = `${properties.mstrahlung.toLocaleString().replace(/,/g, "'")} kWh/m&sup2`;

		// Perform calculations and update elements as necessary
		const averageSolarRadiation = properties.mstrahlung * Math.floor(properties.flaeche);
		const roundedAverageSolarRadiation = Math.floor(averageSolarRadiation / 100) * 100;
		document.getElementById('average-solar-radiation').innerText = `${roundedAverageSolarRadiation.toLocaleString().replace(/,/g, "'")} kWh`;

		const color = properties.color;
		this.updateSuitabilityBox(color);
		document.getElementById('notyetlocalized-text').style.display = 'none';

		this.updateSolarElectricityCalculations(properties);
	}

	async fetchAndRenderGeoJson(latitude, longitude) {
		// console.log("fetchAndRenderGeoJson - Latitude: ", latitude, "Type: ", typeof latitude);
		const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
		if (this.cache[cacheKey]) {
			this.renderGeoJson(this.cache[cacheKey]);
		} else {
			const response = await fetch(`/geojson_data?latitude=${latitude}&longitude=${longitude}`);
			const geojsonData = await response.json();
			this.cache[cacheKey] = geojsonData;
			this.renderGeoJson(geojsonData);
		}
	}

	renderGeoJson(geojsonData) {
		if (this.geoJsonLayer) {
			this.map.removeLayer(this.geoJsonLayer);
		}

		this.geoJsonLayer = L.geoJson(geojsonData, {
			style: feature => ({
				fillColor: feature.properties.color,
				color: 'black',
				weight: 1,
				opacity: 0.5,
				fillOpacity: 0.7
			}),
			onEachFeature: (feature, layer) => {
				layer.on('click', this.onPolygonClick.bind(this));
			}
		}).addTo(this.map);

		const bestPolygon = this.getBestPolygon(geojsonData.features, geojsonData.user_sb_uuid);
		if (bestPolygon) {
			this.updateRoofData(bestPolygon.properties);
			if (this.marker) {
				this.map.removeLayer(this.marker);
			}
			const centroid = this.getCentroid(bestPolygon.geometry.coordinates[0]);
			this.marker = L.marker([centroid[1], centroid[0]]).addTo(this.map);
		}
	}

	async updateMap(address) {
		const response = await fetch('/geocode', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ address }),
		});

		const data = await response.json();
		if (data.latitude && data.longitude) {
			this.map.setView([data.latitude, data.longitude], 19);
			await this.fetchAndRenderGeoJson(data.latitude, data.longitude);
		}
		console.log("CALLED updaateMap!");
	}

	async handleAddressSelection(address) {
		await this.updateMap(address);
	}

	updateDisplayedAddress(address) {
		document.getElementById('selected-address').innerText = address || "Not yet localized";
	}

	onPolygonClick(e) {
		if (e.target && e.target.feature && e.target.feature.properties) {
			const properties = e.target.feature.properties;
			this.updateRoofData(properties);

			if (properties.latitude && properties.longitude) {
				MapHandler.updateDisplayedAddress(`${properties.latitude}, ${properties.longitude}`);
			}
		} else {
			console.log('Could not access feature properties:', e);
		}

		if (e.latlng) {
			const latitude = e.latlng.lat;
			const longitude = e.latlng.lng;

			// Send a request to the /geocode endpoint with the latitude and longitude
			fetch('/geocode', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ latitude, longitude }),
			})
				.then(response => response.json())
				.then(data => {
					if (data.address) {
						document.getElementById('selected-address').innerText = data.address;
					}
				})
				.catch(err => {
					console.error('Error fetching address:', err);
				});
		}

		if (e.target && e.target.feature && e.target.feature.geometry) {
			if (this.marker) {
				this.map.removeLayer(this.marker);
			}
			const centroid = this.getCentroid(e.target.feature.geometry.coordinates[0]);
			this.marker = L.marker([centroid[1], centroid[0]]).addTo(this.map);
		}
	}

	getCentroid(coords) {
		if (coords.length === 1 && Array.isArray(coords[0])) {
			coords = coords[0]; // Access the inner array
		}

		let center = [0, 0];
		coords.forEach((coord, index) => {
			if (Array.isArray(coord) && coord.length >= 2) {
				center[0] += coord[0];
				center[1] += coord[1];
			}
		});

		center[0] /= coords.length;
		center[1] /= coords.length;

		return center;
	}

	updateSolarElectricityCalculations(properties) {
		const averageSolarRadiation = properties.mstrahlung * Math.floor(properties.flaeche);

		// Round the fullSurface to the nearest 100.
		const fullSurfaceValue = Math.round(averageSolarRadiation * 0.16 / 100) * 100;
		const fullSurface = fullSurfaceValue.toLocaleString().replace(/,/g, "'");

		// Calculate solar electricity for different surface usages based on the rounded fullSurface
		const halfSurfaceValue = fullSurfaceValue * 0.5;
		const halfSurface = halfSurfaceValue.toLocaleString().replace(/,/g, "'");

		const threeQuarterSurfaceValue = fullSurfaceValue * 0.75;
		const threeQuarterSurface = threeQuarterSurfaceValue.toLocaleString().replace(/,/g, "'");

		// Update the HTML elements with the calculated values
		document.getElementById('half-surface').innerText = `${halfSurface} kWh`;
		document.getElementById('three-quarter-surface').innerText = `${threeQuarterSurface} kWh`;
		document.getElementById('full-surface').innerText = `${fullSurface} kWh`;

		// Calculate moneyworth and round up to the nearest 100.
		const moneyworthValue = fullSurfaceValue * 0.1;
		const moneyworth = Math.ceil(moneyworthValue / 100) * 100;

		document.getElementById('monetary-placeholder').innerText = `${moneyworth} CHF`;
	}

};

export default MapHandler;
