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
  res.render('rsvp', {
    guest: null,
    message: null,
  });
});

app.post('/rsvp', async (req, res) => {
  try {
    // Authenticate and get the client
    const client = await authenticate();

    // Read row(s) from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: 'wedding-guests!A2:A',
    });

    const typedName = req.body.guest_input_last_name;
    let sheetNames = getRows.data.values.flat();

    if (sheetNames.includes(typedName)) {
      res.redirect('/guestinfo?guest=' + typedName);
    } else {
      res.render('rsvp', {
        guest: null,
        message: 'Sorry, no match found! Maybe check the spelling?',
        error: true,
      });
    }
  } catch (error) {
    // Handle any errors that occur during authentication or API requests
    console.error('Error:', error);
    res.status(500).send('An error occured.');
  }
});

// app.post('/rsvp', async (req, res) => {

//   const auth = new google.auth.GoogleAuth({
//     keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//   });

//     // Create client instance for auth
//     const client = await auth.getClient();

//     const googleSheets = google.sheets({ version: 'v4' });
//     const spreadsheetId = process.env.SSID;
//     const metaData = await googleSheets.spreadsheets.get({
//       auth,
//       spreadsheetId,
//     });

//     const getRows = await googleSheets.spreadsheets.values.get({
//       auth,
//       spreadsheetId,
//       range: 'wedding-guests',
//     });

//     res.send(getRows.data);
// });

app.get('/guestinfo', (req, res) => {
  const guest = req.query.guest
  if (!guest) {
    res.redirect('/rsvp');
  } else {
    res.render('guestInfo', {
      guest: guest,
      message: null,
    });
  }
});

app.post('/submit', express.json(), async (req, res) => {
  try {
    const selectedGuest = req.body.guest;
    const rsvpStatus = req.body.guestStatus;

  // Authenticate and get the client
  const client = await authenticate();  

  // Read row(s) from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range: 'wedding-guests!A2:A',
  });

  const sheetNames = getRows.data.values.flat();

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.update({
    auth: client,
    spreadsheetId,
    range: `wedding-guests!M${sheetNames.indexOf(selectedGuest) + 2}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[rsvpStatus === 'yes' ? responseYes : responseNo]],
    },
  });

  console.log('Guest:', selectedGuest);
  console.log('RSVP Status:', rsvpStatus);

  res.render('success', {
    guest: selectedGuest,
    message: 'Your RSVP has been sent!',
  });
  } catch (error) {
    console.error('Error processing RSVP:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/details', async (req, res) => {
  res.render('details');
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});