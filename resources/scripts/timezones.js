// timezones.js

const timezoneMapping = {
    "UK": {
        apiTimezone: "Europe/London",
        flag: "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg"
    },
    "Germany": {
        apiTimezone: "Europe/Berlin",
        flag: "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg"
    },
    "Switzerland": {
        apiTimezone: "Europe/Zurich",
        flag: "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg"
    }
};


async function fetchTimezoneInfo(countryCode) {
    const timezoneData = timezoneMapping[countryCode] || { apiTimezone: "UTC", flag: "" };
    console.log(`Fetching timezone info for: ${countryCode}`);

    try {
        const response = await fetch(`https://worldtimeapi.org/api/timezone/${timezoneData.apiTimezone}`);
        if (response.ok) {
            const data = await response.json();

            // Log full timezone data for debugging
            console.log(`Timezone data for ${countryCode}:`, data);

            // Set isDSTActive based on the API response
            isDSTActive = data.dst;

            // Directly use the datetime string from the API without converting to a JavaScript Date object
            const datetimeString = data.datetime;

            // Extract the time portion (HH:mm:ss) from the datetime string
            const time = datetimeString.split('T')[1].split('.')[0]; // Get the '21:22:16' part
            console.log(`${countryCode} Time: ${time}`);

            // Display the extracted time in the UI
            document.getElementById('localTime').textContent = time;

            // Update the timezone flag
            document.getElementById('timezoneFlag').src = timezoneData.flag;

            // Display the timezone abbreviation (e.g., GMT, BST, CET, CEST)
            const abbreviation = data.abbreviation;
            document.getElementById('timezoneAbbreviation').textContent = `(${abbreviation})`;

            // Return the fetched data, including datetime, to status.js
            return data;

        } else {
            throw new Error('Failed to fetch timezone data: ' + response.status);
        }

    } catch (error) {
        console.error("Error during fetch:", error);
        document.getElementById('localTime').textContent = "Error fetching time";
        document.getElementById('timezoneFlag').src = ""; // Reset flag in case of error
        return null; // Ensure we return null on error
    }
}
function updateAvailability(abbreviation) {
    const availabilityElement = document.getElementById('availability');
    const availability = document.getElementById('availabilityStatus').value;

    // Append the abbreviation (BST/GMT) to the availability hours
    console.log("Updating availability with abbreviation:", abbreviation);
    availabilityElement.textContent = `Available from ${availability} (${abbreviation})`;
}