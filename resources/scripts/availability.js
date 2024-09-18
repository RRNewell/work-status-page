// availability.js

function updateAvailability(abbreviation) {
    const availability = document.getElementById('hdn_availabilityStatus').value;
    document.getElementById('availability').textContent = `${availability} (${abbreviation})`;
}
