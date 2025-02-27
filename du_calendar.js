const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const baseUrl = 'https://www.du.edu/calendar?start_date=2025-01-01&end_date=2025-12-31';

// Function to fetch event details from an event page
async function fetchEventDetails(eventUrl) {
    try {
        const response = await axios.get(eventUrl);
        const $ = cheerio.load(response.data);

        // Extract description if available, otherwise return null
        const description = $('div[itemprop="description"].description p').text().trim();
        return description || null;
    } catch (error) {
        console.error(`Error fetching event details from ${eventUrl}:`, error);
        return null;
    }
}

// Function to scrape the DU events calendar
async function scrapeDUEvents() {
    try {
        const response = await axios.get(baseUrl);
        const $ = cheerio.load(response.data);

        const events = [];

        $('.events-listing__item').each((index, element) => {
            const title = $(element).find('h3').text().trim();
            const date = $(element).find('p').first().text().trim();

            // Trying to capture both start and end time
            const timeText = $(element).find('p:has(.icon-du-clock)').text().trim();
            const timeParts = timeText.split('-');
            
            let timeStart = timeParts[0]?.trim() || null;
            let timeEnd = timeParts[1]?.trim() || null;
            
            // Extract the relative URL for the event description
            const relativeUrl = $(element).find('a.event-card').attr('href');
            const eventUrl = relativeUrl ? relativeUrl.trim() : null;

            // Convert and format the event date in a readable format (e.g., "January 15")
            const eventDate = new Date(`${date}, 2025`);
            const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

            // Define the start and end dates to filter events within the desired range
            const startDate = new Date('2025-01-01');
            const endDate = new Date('2025-12-31');

            if (eventDate >= startDate && eventDate <= endDate) {
                let timeRange = null;

                // Format the time range as "start-end" if both start and end times exist
                if (timeStart && timeEnd) {
                    timeRange = `${timeStart}-${timeEnd}`;
                } else if (timeStart) {
                    timeRange = timeStart;
                }

                // Push the event details into the events array, conditionally adding time and URL fields
                events.push({
                    title,
                    date: formattedDate,
                    ...(timeRange && { time: timeRange }),
                    ...(eventUrl && { eventUrl })
                });
            }
        });

        // Fetch all descriptions in parallel, and omit those with no descriptions
        const descriptions = await Promise.all(
            events.map(event => event.eventUrl ? fetchEventDetails(event.eventUrl) : Promise.resolve(null))
        );

        // Assign fetched descriptions to the events
        events.forEach((event, index) => {
            const description = descriptions[index];
            if (description) {
                event.description = description;
            }
            delete event.eventUrl; // Remove URL after fetching description
        });

        // Ensure the results directory exists
        const resultsDir = path.join(__dirname, 'results');
        if (!fs.existsSync(resultsDir)) {
            fs.mkdirSync(resultsDir);
        }

        // Save the events to a JSON file
        const filePath = path.join(resultsDir, 'calendar_events.json');
        fs.writeFileSync(filePath, JSON.stringify({ events }, null, 2));

        console.log('Scraping complete! Saved events to calendar_events.json');
    } catch (error) {
        console.error('Error during scraping:', error);
    }
}

// Run the scraping function
scrapeDUEvents();
