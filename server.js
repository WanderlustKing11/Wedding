require('dotenv').config();
const express = require('express');
const app = express();
const https = require('https');
const port = process.env.PORT || 3000;
const path = require('path');
const { google } = require('googleapis');
const sheets = google.sheets('v4');

console.log(process.env.SSID);
console.log(process.env.CREDENTIALS);

// Load Google Sheets credentials and authenticate
const credentials = {
// ...
}

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});
google.options({ auth });

// middleware and other server configuration
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['css'] }));

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  res.sendFile(indexPath);
});


app.get('/rsvp', (req, res) => {
  const rsvpPath = path.join(__dirname, 'rsvp.html');
  res.sendFile(rsvpPath)
});

// RSVP endpoint
app.post('/rsvp', express.json(), async (req, res) => {
  const { lastName, rsvpStatus } = req.body;

  try {
    // Fetch guest data based on last name
    const guestData = await fetchGuestData(lastName);

    if (guestData) {
      const { firstName, address } = guestData;

      // Update Google Sheets with the RSVP status
      const spreadsheetId = process.env.SSID;
      const range = 'Wedding Guests!E2'; // "RSVP status" is in column E, starting from row 2
      const resource = {
        values: [[rsvpStatus]], // Update the RSVP status
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