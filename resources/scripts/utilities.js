function parseAvailabilityHours(availabilityString) {
    // Example input: "8 AM - 5 PM"
    const [startTime, endTime] = availabilityString.split(' - ').map(time => convertTo24Hour(time));
    return { start: startTime, end: endTime };
}

function convertTo24Hour(timeStr) {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');

    if (!minutes) minutes = '00'; // Ensure minutes are always available

    if (hours === "12") {
        hours = "00";
    }

    if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
    }

    return parseInt(hours, 10);
}