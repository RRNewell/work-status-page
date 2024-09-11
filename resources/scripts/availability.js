// availability.js

function updateAvailability(abbreviation) {
    const availability = document.getElementById('availabilityStatus').value;
    document.getElementById('availability').textContent = `Available from ${availability} (${abbreviation})`;
}
