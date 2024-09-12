let isDSTActive = false; // Ensure this is declared here
let localTimezoneOffset = 0; // Store the offset for the selected timezone

function updateStatus() {
    const workLocation = document.getElementById('workLocation').value;
    const availability = document.getElementById('availabilityStatus').value;
    const locationElement = document.getElementById('location');
    const availabilityElement = document.getElementById('availability');
    const timezoneCode = document.getElementById('timezoneCode').value;

    console.log("Updating status for timezone:", timezoneCode);

    // Ensure isDSTActive is defined
    if (typeof isDSTActive === 'undefined') {
        console.error('isDSTActive is not defined, setting it to false.');
        isDSTActive = false; // Default to false if undefined
    }

    // Parse the availability hours from the hidden field
    const { start, end } = parseAvailabilityHours(availability);

    // Fetch current time and flag based on the selected country (e.g., UK, Germany, Switzerland)
    fetchTimezoneInfo(timezoneCode).then((timezoneData) => {
        if (!timezoneData || !timezoneData.datetime) {
            console.error('Timezone data is undefined or does not contain datetime.');
            return;
        }
        
        const currentTime = new Date(timezoneData.datetime); // Use the fetched time from the API

        // Instead of manually calculating the offset, use the getTimezoneOffset() method
        const browserTimezoneOffset = new Date().getTimezoneOffset() * 60000; // In milliseconds
        const timezoneOffset = currentTime.getTimezoneOffset() * 60000; // API timezone offset in milliseconds

        // Calculate the correct offset based on the difference between the browser's timezone and the fetched timezone
        localTimezoneOffset = timezoneOffset - browserTimezoneOffset;

        // Start updating local time every second
        updateLocalTime();

        const now = new Date();
        const currentHour = now.getUTCHours() + (isDSTActive ? 1 : 0); // Adjust for DST if active
        console.log(`Current UTC Hour: ${now.getUTCHours()}, Adjusted Hour: ${currentHour}`);

        // Handle work location logic based on availability hours
        if (currentHour >= start && currentHour < end) {
            if (timezoneCode === "Germany" || timezoneCode === "Switzerland") {
                locationElement.innerHTML = `Working abroad <i class="fas fa-plane"></i>`;
            } else {
                if (workLocation === 'home') {
                    locationElement.innerHTML = `Working from home <i class="fas fa-home"></i>`;
                } else if (workLocation === 'work') {
                    locationElement.innerHTML = `Working in office <i class="fas fa-building"></i>`;
                }
            }
        } else {
            locationElement.innerHTML = `Offline <i class="fas fa-moon moon"></i><span class="floating-z">Z</span><span class="floating-z" style="right: -30px;">Z</span><span class="floating-z" style="right: -50px;">Z</span>`;
            locationElement.classList.add("offline");
        }

        // Update the availability display with BST/GMT
        updateAvailability('BST');

        // Update the status circle based on the last updated time
        const lastUpdated = document.getElementById('lastUpdated').value;
        updateLastUpdatedStatus(lastUpdated);
    }).catch((error) => {
        console.error('Failed to fetch timezone data', error);
    });
}

function updateLocalTime() {
    // Start updating local time every second using the calculated timezone offset
    setInterval(() => {
        const now = new Date();
        const adjustedLocalTime = new Date(now.getTime() + localTimezoneOffset);
        document.getElementById('localTime').textContent = adjustedLocalTime.toLocaleTimeString();
    }, 1000);
}


function updateLastUpdatedStatus(lastUpdated) {
    const statusCircle = document.getElementById('status-circle');
    const lastUpdatedDate = new Date(lastUpdated);
    const currentDate = new Date();
    const diffHours = Math.abs(currentDate - lastUpdatedDate) / 36e5;

    let backgroundColor;
    if (diffHours <= 2) {
        backgroundColor = '#32CD32'; // Green for recently updated (0-2 hours)
    } else if (diffHours > 2 && diffHours <= 4) {
        backgroundColor = '#9ACD32'; // Yellow-green (2-4 hours)
    } else if (diffHours > 4 && diffHours <= 5) {
        backgroundColor = '#FFD700'; // Yellow (4-5 hours)
    } else if (diffHours > 5 && diffHours <= 6) {
        backgroundColor = '#FFA500'; // Orange (5-6 hours)
    } else if (diffHours > 6 && diffHours <= 7) {
        backgroundColor = '#FF8C00'; // Dark Orange (6-7 hours)
    } else if (diffHours > 7 && diffHours <= 8) {
        backgroundColor = '#FF4500'; // Red-orange (7-8 hours)
    } else {
        backgroundColor = '#FF0000'; // Red for overdue updates (over 8 hours)
    }

    statusCircle.style.backgroundColor = backgroundColor;
    statusCircle.title = `Last updated ${diffHours.toFixed(2)} hours ago`;
}
