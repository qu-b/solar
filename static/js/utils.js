function ensureNonNegativeValue(inputElement) {
	if (parseFloat(inputElement.value) < 0) {
		inputElement.value = 0;
	}
}

export { ensureNonNegativeValue };
