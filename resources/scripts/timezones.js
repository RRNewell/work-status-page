class TimeZone {
    constructor(countryCode, apiTimezone, flag, abroad) {
        this.countryCode = countryCode;
        this.apiTimezone = apiTimezone;
        this.flag = flag;
        this.rawDateTime = null; // Store the datetime string from the API
        this.abbreviation = null;
        this.utcOffset = null; // Store the UTC offset from the API
        this.abroad = abroad;
    }

    // Fetch the correct timezone data from the primary API
    async fetchPrimaryAPI() {
        try {
            const response = await fetch(`https://worldtimeapi.org/api/timezone/${this.apiTimezone}`);
            if (response.ok) {
                const data = await response.json();

                console.log(`API Response for ${this.apiTimezone}:`, data);

                // Save the raw datetime from the API, without using the Date object
                this.rawDateTime = data.datetime;
                this.abbreviation = data.abbreviation; // Abbreviation like BST, CEST, etc.
                this.utcOffset = data.utc_offset; // Store the UTC offset (e.g., "+02:00")
                return true; // Return true to indicate success
            } else {
                throw new Error('Failed to fetch timezone data from primary API');
            }
        } catch (error) {
            console.error("Primary API failed:", error);
            return false; // Return false to indicate failure
        }
    }

    // Fetch timezone data from worldclockapi.com if the primary API fails
    async fetchBackupAPI() {
        try {
            const response = await fetch(`http://worldclockapi.com/api/json/${this.apiTimezone}/now`);
            if (response.ok) {
                const data = await response.json();

                console.log(`Backup API Response for ${this.apiTimezone}:`, data);

                // Save the datetime from the backup API
                this.rawDateTime = data.currentDateTime; // Format could be different depending on API
                this.abbreviation = data.timeZoneName; // Example: CEST, BST, etc.
                this.utcOffset = data.utcOffset; // Example offset
                return true; // Return true to indicate success
            } else {
                throw new Error('Failed to fetch timezone data from backup API');
            }
        } catch (error) {
            console.error("Backup API failed:", error);
            return false; // Return false to indicate failure
        }
    }

    // Initialize timezone data, trying primary and then fallback to backup API
    async initializeTimeZone() {
        const success = await this.fetchPrimaryAPI();
        if (!success) {
            // If the primary API fails, try the backup API
            //console.log(`Trying backup API for ${this.apiTimezone}`);
            //await this.fetchBackupAPI();
        }
    }

    // Return the time portion from the rawDateTime (HH:mm:ss)
    getTime24Hour() {
        if (this.rawDateTime) {
            const time = this.rawDateTime.split('T')[1].split('.')[0];
            return time;
        }
        return "Time not available";
    }

    // Return the abbreviation for this timezone (e.g., BST, GMT)
    getAbbreviation() {
        return this.abbreviation || "N/A";
    }
	
	
	getFlag() {
        return this.flag || "";
    }

    // Return timezone information for logging or display purposes
    displayTimezoneInfo() {
        return {
            time: this.getTime24Hour(),
            abbreviation: this.getAbbreviation(),
            flag: this.flag,
            countryCode: this.countryCode,
            abroad: this.abroad
        };
    }
}

// Define the time zones with their respective time zone IDs
const timeZones = {
    "UK": new TimeZone("UK", "Europe/London", "https://upload.wikimedia.org/wikipedia/en/a/ae/Flag_of_the_United_Kingdom.svg", false),
    "Germany": new TimeZone("Germany", "Europe/Berlin", "https://upload.wikimedia.org/wikipedia/en/b/ba/Flag_of_Germany.svg", true),
    "Switzerland": new TimeZone("Switzerland", "Europe/Zurich", "https://upload.wikimedia.org/wikipedia/commons/f/f3/Flag_of_Switzerland.svg", true),
    "France": new TimeZone("France", "Europe/Paris", "https://upload.wikimedia.org/wikipedia/en/c/c3/Flag_of_France.svg", true),
    "UTC": new TimeZone("UTC", "UTC", "", true)
};
