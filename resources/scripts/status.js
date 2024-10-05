async function updateStatus() {
    const eWorkLocation = document.getElementById('hdn_workLocation').value;
    const eAvailabilityStatus = document.getElementById('hdn_availabilityStatus').value; // Example: "8 AM - 5 PM"
    const eCurrentLocation = document.getElementById('hdn_currentLocation');
    const eLocalTimezone = document.getElementById('hdn_localTimezone').value;
    const eAvailabilityTimezone = document.getElementById('hdn_availabilityTimezone').value;

    console.log("Updating status for timezone:", eLocalTimezone);

    // Fetch timezone info for the selected local timezone and UTC timezone
    const selectedTimeZone = timeZones[eLocalTimezone];
    const selectedAvailableTimeZone = timeZones[eAvailabilityTimezone];
    const utcTimeZone = timeZones["UTC"];

    if (selectedTimeZone && selectedAvailableTimeZone) {
        // Fetch data for the selected local timezone and UTC
        await selectedTimeZone.initializeTimeZone();
        await selectedAvailableTimeZone.initializeTimeZone();
        await utcTimeZone.initializeTimeZone();

        // Initially set the UTC time
        document.getElementById('utc-time').textContent = utcTimeZone.getTime24Hour();
        
        // Set the local time based on UTC and the selected timezone offset
        updateLocalTimeWithOffset(selectedTimeZone);

        document.getElementById('timezoneFlag').src = selectedTimeZone.getFlag();

        const localTimeInfo = selectedTimeZone.displayTimezoneInfo();

        // Calculate the current adjusted UTC time for eAvailabilityStatus comparison
        const currentTimeInAvailabilityTimeZone = getAdjustedTime(utcTimeZone, selectedAvailableTimeZone);
        const isWithinAvailability = checkAvailability(eAvailabilityStatus, currentTimeInAvailabilityTimeZone);

        // If outside of eAvailabilityStatus, set to Offline
        if (!isWithinAvailability) {
			document.getElementById('location').innerHTML = `<div class="samurai-red" style="display:inline;"> Offline <i class="fas fa-moon moon"></i>
                <span class="floating-z">Z</span>
                <span class="floating-z" style="right: -11px;">Z</span>
                <span class="floating-z" style="right: -12px;">Z</span></div>`;
        } else {
            if (localTimeInfo.abroad) {
                document.getElementById('location').innerHTML = `Working abroad <i class="fas fa-plane"></i>`;
            } else {
                if (eWorkLocation === 'home') {
                    document.getElementById('location').innerHTML = `Working from home <i class="fas fa-home"></i>`;
                } else if (eWorkLocation === 'work') {
                    document.getElementById('location').innerHTML = `Working in office <i class="fas fa-building"></i>`;
                }
            }
        }

        // Update the eAvailabilityStatus display with the correct timezone abbreviation
        updateAvailability(selectedAvailableTimeZone.abbreviation);
    } else {
        console.error("No timezone selected.");
    }

    // Update the last updated status circle
    const lastUpdated = document.getElementById('hdn_lastUpdated').value;
    updateLastUpdatedStatus(lastUpdated);

    // Now, we call the function to start incrementing UTC time
    setInterval(() => incrementUTCTime(selectedTimeZone), 1000);  // Call incrementUTCTime every second
}

// Function to adjust UTC time by the selected timezone offset
function getAdjustedTime(utcTimeZone, selectedAvailableTimeZone) {
    const utcTime = utcTimeZone.rawDateTime.split('T')[1].split('.')[0]; // Get UTC time from raw data
    let [hours, minutes] = utcTime.split(":").map(Number);

    // Get the offset from the eAvailabilityStatus timezone (e.g., "+02:00" or "-01:00")
    const offsetSign = selectedAvailableTimeZone.utcOffset[0];
    const offsetHours = parseInt(selectedAvailableTimeZone.utcOffset.slice(1, 3), 10);
    const offsetMinutes = parseInt(selectedAvailableTimeZone.utcOffset.slice(4), 10);

    console.log(`UTC Time: ${hours}:${minutes}, Offset: ${offsetSign}${offsetHours}:${offsetMinutes}`);

    // Apply the offset to the UTC time
    if (offsetSign === '+') {
        hours += offsetHours;
        minutes += offsetMinutes;
    } else {
        hours -= offsetHours;
        minutes -= offsetMinutes;
    }

    // Handle overflow for hours and minutes
    if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    } else if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }

    if (hours >= 24) {
        hours -= 24;
    } else if (hours < 0) {
        hours += 24;
    }

    const adjustedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    console.log(`Adjusted Time: ${adjustedTime}`);
    
    return adjustedTime;
}


// Function to check if the current time is within eAvailabilityStatus hours
function checkAvailability(eAvailabilityStatus, currentTime) {
    // Check if today is Saturday or Sunday
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // getDay() returns 0 for Sunday and 6 for Saturday
    
    // If it's Saturday (6) or Sunday (0), return false immediately
    if (currentDay === 6 || currentDay === 0) {
        console.log("It's the weekend, availability is set to false.");
        return false;
    }

    const [start, end] = eAvailabilityStatus.split(' - ').map(parseTime);
    const current = parseTime(currentTime);
    
    console.log(`Checking availability: Start: ${start}, End: ${end}, Current: ${current}`);

    // Check if the current time is within the eAvailabilityStatus window
    return current >= start && current <= end;
}

// Helper function to convert "8 AM - 5 PM" format to a comparable time number (e.g., 08:00 = 800)
function parseTime(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    
    // If the time string is in 12-hour format (e.g., '8 AM - 5 PM'), handle it here
    if (isNaN(hours)) {
        const timeParts = timeStr.split(' ');
        hours = Number(timeParts[0]);
        minutes = 0;
        
        if (timeParts[1] === 'PM' && hours !== 12) {
            hours += 12;
        } else if (timeParts[1] === 'AM' && hours === 12) {
            hours = 0;
        }
    }

    return hours * 100 + minutes; // Convert to a format like 800 or 1700 for comparison
}

// Function to update local time based on UTC and offset
function updateLocalTimeWithOffset(selectedTimeZone) {
    const utcTimeElement = document.getElementById('utc-time').textContent;
    let [hours, minutes, seconds] = utcTimeElement.split(":").map(Number);

    // Convert the UTC offset (e.g., "+02:00" or "-01:00") into hours and minutes
    const offsetSign = selectedTimeZone.utcOffset[0];
    const offsetHours = parseInt(selectedTimeZone.utcOffset.slice(1, 3), 10);
    const offsetMinutes = parseInt(selectedTimeZone.utcOffset.slice(4), 10);

    // Apply the offset to the UTC time
    if (offsetSign === '+') {
        hours += offsetHours;
        minutes += offsetMinutes;
    } else {
        hours -= offsetHours;
        minutes -= offsetMinutes;
    }

    // Handle overflow for hours and minutes
    if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    } else if (minutes < 0) {
        minutes += 60;
        hours -= 1;
    }

    if (hours >= 24) {
        hours -= 24;
    } else if (hours < 0) {
        hours += 24;
    }

    // Update the local time element with the adjusted time
    document.getElementById('localTime').textContent =
        String(hours).padStart(2, '0') + ":" +
        String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');
}

// Modify the incrementUTCTime function to increment both UTC and local time
function incrementUTCTime(selectedTimeZone) {
    const utcTimeElement = document.getElementById('utc-time');
    let currentUTCTime = utcTimeElement.textContent.split(":").map(Number);

    let hours = currentUTCTime[0];
    let minutes = currentUTCTime[1];
    let seconds = currentUTCTime[2];

    // Increment the seconds
    seconds += 1;

    // Handle overflow for minutes and hours
    if (seconds >= 60) {
        seconds = 0;
        minutes += 1;
    }
    if (minutes >= 60) {
        minutes = 0;
        hours += 1;
    }
    if (hours >= 24) {
        hours = 0;
    }

    // Update the UTC time element
    utcTimeElement.textContent =
        String(hours).padStart(2, '0') + ":" +
        String(minutes).padStart(2, '0') + ":" +
        String(seconds).padStart(2, '0');

    // Now, update the local time with the same offset logic
    updateLocalTimeWithOffset(selectedTimeZone);
}

// Update eAvailabilityStatus with abbreviation
function updateAvailability(abbreviation) {
    const availabilityElement = document.getElementById('availability');
    const availability  = document.getElementById('hdn_availabilityStatus').value;

    // Append the abbreviation (BST/GMT) to the eAvailabilityStatus hours
    availabilityElement.textContent = `Available from ${availability } (${abbreviation})`;
}

// Update the last updated status
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


