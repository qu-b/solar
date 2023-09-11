document.addEventListener("DOMContentLoaded", function () {
	const calculatorForm = document.getElementById("calculator-form");
	const outputElement = document.getElementById("output");
	const roofSizeInput = document.getElementById("installation_size");
	const solarRadiationInput = document.getElementById("solar_radiation");

	// Function to ensure input values are non-negative
	function ensureNonNegativeValue(inputElement) {
		if (parseFloat(inputElement.value) < 0) {
			inputElement.value = 0;
		}
	}

	// Initialize energy output and savings charts
	let energyOutputChart;
	let savingsChart;

	// Function to initialize or update energy output chart with default data
	function initializeOrUpdateEnergyOutputChart() {
		if (energyOutputChart) {
			energyOutputChart.destroy();
		}

		const energyOutputCtx = document.getElementById('energyOutputChart').getContext('2d');
		energyOutputChart = new Chart(energyOutputCtx, {
			type: 'bar',
			data: {
				labels: ['Daily', 'Monthly', 'Yearly'],
				datasets: [{
					label: 'Energy Output (kWh)',
					data: [0, 0, 0], // Default data
					backgroundColor: [
						'rgba(255, 99, 132, 0.5)',
						'rgba(54, 162, 235, 0.5)',
						'rgba(255, 206, 86, 0.5)'
					],
					borderColor: [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	// Function to initialize or update energy savings chart with default data
	function initializeOrUpdateSavingsChart() {
		if (savingsChart) {
			savingsChart.destroy();
		}

		const savingsCtx = document.getElementById('savingsChart').getContext('2d');
		savingsChart = new Chart(savingsCtx, {
			type: 'bar',
			data: {
				labels: ['Daily', 'Monthly', 'Yearly'],
				datasets: [{
					label: 'Energy Savings (CHF)',
					data: [0, 0, 0], // Default data
					backgroundColor: [
						'rgba(54, 162, 235, 0.5)',
						'rgba(75, 192, 192, 0.5)',
						'rgba(255, 206, 86, 0.5)'
					],
					borderColor: [
						'rgba(54, 162, 235, 1)',
						'rgba(75, 192, 192, 1)',
						'rgba(255, 206, 86, 1)'
					],
					borderWidth: 1
				}]
			},
			options: {
				scales: {
					y: {
						beginAtZero: true
					}
				}
			}
		});
	}

	// Function to update the energy output chart
	function updateEnergyOutputChart(energyOutput) {
		if (!energyOutputChart) {
			initializeOrUpdateEnergyOutputChart(); // Create chart with default data
		}
		// Update chart data
		energyOutputChart.data.datasets[0].data = [energyOutput, energyOutput * 30, energyOutput * 365];
		energyOutputChart.update(); // Update the chart
	}

	// Function to fetch and calculate solar energy, and update the chart
	function fetchAndCalculateEnergyOutput(roofSize, solarRadiation) {
		fetch("/calculate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				installation_size: parseFloat(roofSize),
				solar_radiation: parseFloat(solarRadiation),
			}),
		})
			.then(response => response.json())
			.then(data => {
				const energyOutput = data.energy_output.toFixed(2);
				outputElement.textContent = energyOutput;
				updateEnergyOutputChart(energyOutput);
			})
			.catch(error => {
				console.error("Error:", error);
				outputElement.textContent = "Error";
			});
	}

	// Function to perform the solar energy calculation
	function calculateEnergyOutput() {
		ensureNonNegativeValue(roofSizeInput);
		ensureNonNegativeValue(solarRadiationInput);

		const roofSize = roofSizeInput.value;
		const solarRadiation = solarRadiationInput.value;

		if (roofSize && solarRadiation) {
			fetchAndCalculateEnergyOutput(roofSize, solarRadiation);
		}
	}

	// Energy Savings Calculator
	const savingsForm = document.getElementById("savings-calculator-form");
	const savingsOutputElement = document.getElementById("savings_output");
	const currentEnergyConsumptionInput = document.getElementById("current_energy_consumption");
	const electricityRateInput = document.getElementById("electricity_rate");

	// Function to calculate energy savings and update the chart
	function calculateEnergySavings() {
		const currentEnergyConsumption = currentEnergyConsumptionInput.value;
		const electricityRate = electricityRateInput.value;

		if (currentEnergyConsumption && electricityRate) {
			const energySavings = (currentEnergyConsumption * electricityRate).toFixed(2);
			savingsOutputElement.textContent = energySavings;

			// Update the energy savings chart with the calculated data
			initializeOrUpdateSavingsChart();
			savingsChart.data.datasets[0].data = [energySavings, energySavings * 30, energySavings * 365];
			savingsChart.update();
		}
	}

	// Attach event listeners to input fields for the solar energy calculator
	roofSizeInput.addEventListener("input", calculateEnergyOutput);
	solarRadiationInput.addEventListener("input", calculateEnergyOutput);

	// Attach event listeners to input fields for the energy savings calculator
	currentEnergyConsumptionInput.addEventListener("input", calculateEnergySavings);
	electricityRateInput.addEventListener("input", calculateEnergySavings);

	// Initialize charts with default data
	initializeOrUpdateEnergyOutputChart();
	initializeOrUpdateSavingsChart();


	// MAP SECTION //
	// Initialize map
	// var map = L.map('map').setView([47.3769, 8.5417], 10); // Zurich coordinates and zoom level

	// // Add basemap layer
	// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	// 	attribution: '© OpenStreetMap contributors'
	// }).addTo(map);



	// Handle address form submission
	var addressForm = document.getElementById('address-form');
	addressForm.addEventListener('submit', function (event) {
		event.preventDefault();
		var addressInput = document.getElementById('address');
		var userAddress = addressInput.value;

		// Call the /geocode route to handle the address geocoding
		fetch('/geocode', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ address: userAddress }),
		})
			.then(response => response.json())
			.then(data => {
				if (data.latitude && data.longitude) {
					// Update the map iframe with the new map
					const mapUrl = `/dynamic_map?latitude=${data.latitude}&longitude=${data.longitude}`;
					document.getElementById("map").src = mapUrl;
				}
			})
			.catch(error => {
				console.error('Error in address geocoding:', error);
			});
	});




});
