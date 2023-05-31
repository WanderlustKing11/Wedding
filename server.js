const express = require('express');
const app = express();
const https = require('https');
const port = process.env.PORT || 3000;
const { google } = require('googleapis');
const sheets = google.sheets('v4');

// Load Google Sheets credentials and authenticate
const credentials = require('./path/to/your/credentials.json');
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
google.options({ auth });

// middleware and other server configuration

// RSVP endpoint
app.post('/rsvp', express.json(), async (req, res) => {
  const { lastName, rsvpStatus } = req.body;

  try {
    // Fetch guest data based on last name
    const guestData = await fetchGuestData(lastName);

    if (guestData) {
      const { firstName, address } = guestData;

      // Update Google Sheets with the RSVP status
      const spreadsheetId = 'your-spreadsheet-id';
      const range = 'Sheet1!D2:E'; // Assuming RSVP status is in column D, starting from row 2
      const resource = {
        values: [[rsvpStatus, lastName]], // Update the RSVP status and last name
      };

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        resource,
      });

      // Return a success response
      res.status(200).json({ success: true, message: 'RSVP submitted successfully' });
    } else {
      // Guest not found
      res.status(404).json({ success: false, message: 'Guest not found' });
    }
  } catch (error) {
    console.error('Error processing RSVP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});