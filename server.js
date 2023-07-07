const express = require('express');
const https = require('https');
const path = require('path');
const ejs = require('ejs');
const { google } = require('googleapis');
const { log } = require('console');
require('dotenv').config();
const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // enables us to use forms
app.use('/public/src', express.static(__dirname + '/public/src'));

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: 'v4' });
const spreadsheetId = process.env.SSID;

// Google Auth //
const authenticate = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

    // Create client instance for auth
    const client = await auth.getClient();
    return client;
};


const responseYes = "Attending";
const responseNo = "Not attending";

app.get('/', async (req, res) => {
  res.render('home');
});

app.get('/about-us', async (req, res) => {
  res.render('aboutus');
});

app.get('/photos', async (req, res) => {
  res.render('photos');
});

app.get('/rsvp', async (req, res) => {

  const client = await authenticate();
  const metaData = await googleSheets.spreadsheets.get({
    auth: client,
    spreadsheetId,
    range: 'wedding-guests',
  });
  res.send(getRows.data);

});

// app.get('/rsvp', (req, res) => {
//   // const rsvpPath = path.join(__dirname, 'rsvp.html');
//   // res.sendFile(rsvpPath)
//   res.render('rsvp', {
//     message: null,
//   });
// });

// app.post('/rsvp', async (req, res) => {
//   try {
//     // Authenticate and get the client
//     const client = await authenticate();

//     // Read row(s) from spreadsheet
//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth: client,
//       spreadsheetId,
//       range: 'driver-list!A2:A',
//     });

//     const typedName = req.body.guest_input_last_name;
//     let invitedGuestsLastNames = getRows.data.values.flat();

//     if (invitedGuestsLastNames.includes(typedName)) {
//       res.redirect('/guestinfo?guest=' + typedName);
//     } else {
//       res.render('rsvp', {
//         guest: null,
//         message: 'Sorry, no match found!',
//       });
//     }
//   } catch (error) {
//     // Handle any errors that occur during authentication or API requests
//     console.error('Error:', error);
//     res.status(500).send('An error occured.');
//   }
// });

app.get('/guestInfo', (req, res) => {
  res.render('guestInfo', {
    guest: null,
    message: null,
  });
});

app.post('/guestInfo', express.json(), async (req, res) => {
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