import { ensureNonNegativeValue } from './utils.js';
import { EnergyOutput } from './energy.js';
import { EnergySavings } from './energy.js';
import MapHandler from './map.js';
import AutocompleteHandler from './autocomplete.js';

window.L = L;

// Event handlers
async function onAddressFormSubmit(event) {
	event.preventDefault();
	const userAddress = document.getElementById('address').value;
	await MapHandler.updateMap(userAddress);
	fetchAndDisplayBestPolygon(latitude, longitude);
}

async function onCalculatorInputChange() {
	const roofSize = document.getElementById('installation_size').value;
	const solarRadiation = document.getElementById('solar_radiation').value;
	ensureNonNegativeValue(roofSize);
	ensureNonNegativeValue(solarRadiation);
	await EnergyOutput.fetchAndCalculate(roofSize, solarRadiation);
}

async function onSavingsInputChange() {
	const currentEnergyConsumption = document.getElementById('current_energy_consumption').value;
	const electricityRate = document.getElementById('electricity_rate').value;
	ensureNonNegativeValue(currentEnergyConsumption);
	ensureNonNegativeValue(electricityRate);
	EnergySavings.calculate(currentEnergyConsumption, electricityRate);
}

// DOMContentLoaded event
document.addEventListener("DOMContentLoaded", function () {
	// Initialize the Leaflet map when the DOM is fully loaded
	const mapHandler = new MapHandler();
	mapHandler.initializeMap();
	AutocompleteHandler.initialize(mapHandler);

	// Initialize charts
	EnergyOutput.initializeChart();
	EnergySavings.initializeChart();

	// Attach event listeners
	document.getElementById('address-form').addEventListener('submit', onAddressFormSubmit);
	document.getElementById('installation_size').addEventListener('input', onCalculatorInputChange);
	document.getElementById('solar_radiation').addEventListener('input', onCalculatorInputChange);
	document.getElementById('current_energy_consumption').addEventListener('input', onSavingsInputChange);
	document.getElementById('electricity_rate').addEventListener('input', onSavingsInputChange);

	AutocompleteHandler.attachAutocompleteListener(mapHandler);

	// Hide dropdown when user clicks outside
	document.addEventListener("click", function (event) {
		const dropdown = document.getElementById("autocomplete-dropdown");
		if (!event.target.closest("#autocomplete")) {
			dropdown.style.display = "none";
		}
	});
});
