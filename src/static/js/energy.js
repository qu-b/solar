
// Energy output related functions
const EnergyOutput = {
	chart: null,
	initializeChart() {
		const energyOutputCtx = document.getElementById('energyOutputChart').getContext('2d');
		this.chart = new Chart(energyOutputCtx, {
			type: 'bar',
			data: {
				labels: ['Daily', 'Monthly', 'Yearly'],
				datasets: [{
					label: 'Energy Output (kWh)',
					data: [0, 0, 0],
					backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(54, 162, 235, 0.5)', 'rgba(255, 206, 86, 0.5)'],
					borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)'],
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
	},
	updateChart(energyOutput) {
		this.chart.data.datasets[0].data = [energyOutput, energyOutput * 30, energyOutput * 365];
		this.chart.update();
	},
	async fetchAndCalculate(roofSize, solarRadiation) {
		const response = await fetch("/calculate", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				installation_size: parseFloat(roofSize),
				solar_radiation: parseFloat(solarRadiation),
			}),
		});

		const data = await response.json();
		const energyOutput = data.energy_output.toFixed(2);
		document.getElementById("output").textContent = energyOutput;
		this.updateChart(energyOutput);
	}
};

// Energy savings related functions
const EnergySavings = {
	chart: null,
	initializeChart() {
		const savingsCtx = document.getElementById('savingsChart').getContext('2d');
		this.chart = new Chart(savingsCtx, {
			type: 'bar',
			data: {
				labels: ['Daily', 'Monthly', 'Yearly'],
				datasets: [{
					label: 'Energy Savings (CHF)',
					data: [0, 0, 0],
					backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(255, 206, 86, 0.5)'],
					borderColor: ['rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 206, 86, 1)'],
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
	},
	updateChart(energySavings) {
		this.chart.data.datasets[0].data = [energySavings / 30, energySavings, energySavings * 12];
		this.chart.update();
	},
	calculate(currentEnergyConsumption, electricityRate) {
		const energySavings = (currentEnergyConsumption * electricityRate).toFixed(2);
		document.getElementById("savings_output").textContent = energySavings;
		this.updateChart(energySavings);
	}
};

export { EnergyOutput };
export { EnergySavings };
