import MapHandler from './map.js';

const AUTOCOMPLETE_DROPDOWN_ID = "autocomplete-dropdown";
const AUTOCOMPLETE_INPUT_ID = "autocomplete";

const AutocompleteHandler = {
	mapHandler: null, // This will hold the instance of MapHandler.

	// Initialize the AutocompleteHandler with an instance of MapHandler.
	initialize(mapHandler) {
		this.mapHandler = mapHandler; // Storing the instance of MapHandler.
		this.attachAutocompleteListener(); // Attaching the listener here to avoid calling it separately.
	},

	async fetchAndDisplaySuggestions(query) {
		try {
			const response = await fetch("/autocomplete", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ query }),
			});
			const suggestions = await response.json();
			this.displaySuggestions(suggestions);
		} catch (error) {
			console.error("Error fetching suggestions:", error);
		}
	},

	displaySuggestions(suggestions) {
		const dropdown = document.getElementById(AUTOCOMPLETE_DROPDOWN_ID);
		dropdown.innerHTML = "";
		dropdown.style.display = "block";

		suggestions.forEach(suggestion => {
			const item = document.createElement("div");
			item.textContent = suggestion.description;
			item.classList.add("autocomplete-item");
			item.addEventListener("click", () => this.onAddressSelected(suggestion.description));
			dropdown.appendChild(item);
		});
	},

	async onAddressSelected(selectedAddress) {
		document.getElementById(AUTOCOMPLETE_INPUT_ID).value = selectedAddress;
		document.getElementById(AUTOCOMPLETE_DROPDOWN_ID).style.display = 'none';

		// Using the stored instance of MapHandler to call instance methods.
		this.mapHandler.updateDisplayedAddress(selectedAddress);
		await this.mapHandler.updateMap(selectedAddress);

		document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
	},

	async attachAutocompleteListener() {
		document.getElementById(AUTOCOMPLETE_INPUT_ID).addEventListener("input", async function () {
			const query = this.value;
			if (query.length > 2) {
				AutocompleteHandler.fetchAndDisplaySuggestions(query);
			}
		});
	}
};

export default AutocompleteHandler;
