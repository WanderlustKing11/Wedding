const express = require('express');
const https = require('https');
const path = require('path');
const ejs = require('ejs');
const { google } = require('googleapis');
const { log } = require('console');
require('dotenv').config();
const Cryptr = require('cryptr');
const fs = require('fs');
const port = process.env.PORT || 3000;

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // enables us to use forms
app.use('/public/src', express.static(__dirname + '/public/src'));

// Instance of Google Sheets API
const googleSheets = google.sheets({ version: 'v4' });
const spreadsheetId = process.env.SSID;

// Read and decrypt credentials
const readAndDecryptCredentials = () => {
  const cryptr = new Cryptr(process.env.CRYPTR_SECRET);
  const encryptedData = fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8');
  const decryptedData = cryptr.decrypt(encryptedData);
  return JSON.parse(decryptedData);
}

// Google Auth //
const authenticate = async () => {
  const decryptedCredentials = readAndDecryptCredentials();
  const auth = new google.auth.GoogleAuth({
    keyFile: decryptedCredentials,
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
      range: 'Sheet7!A2:A',
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

app.get('/guestinfo', async (req, res) => {
  try {
    const selectedLastName = req.query.guest;

    // Authenticate and get the client
    const client = await authenticate();

    // Read row(s) from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
      auth: client,
      spreadsheetId,
      range: 'Sheet7!A2:B',
    });

    const data = getRows.data.values;
    const firstNames = data
      .filter(row => row[0] === selectedLastName)
      .map(row => row[1]);

    res.render('guestInfo', {
      guest: selectedLastName,
      firstNames: firstNames,
      message: null,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred.');
  }
});

app.post('/submit', express.json(), async (req, res) => {
  try {
    const selectedGuest = req.body.guest;
    const selectedFirstName = req.body.firstName;
    const rsvpStatus = req.body.guestStatus;
    const dietaryRestriction = req.body.guestDiet;

  // Authenticate and get the client
  const client = await authenticate();  

  // Read row(s) from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth: client,
    spreadsheetId,
    range: 'Sheet7!A2:D',
  });

  const data = getRows.data.values;
  const selectedRow = data.find(row => row[0] === selectedGuest && row[1] === selectedFirstName);

  if (!selectedRow) {
    res.render('error', {
      message: 'Sorry, the selected guest and first name combination is not found.',
    });
    return;
  }

  const selectedRowIndex = data.indexOf(selectedRow);
  const adjustedRowIndex = selectedRowIndex + 2;

  // Write row(s) to spreadsheet
  await googleSheets.spreadsheets.values.update({
    auth: client,
    spreadsheetId,
    range: `Sheet7!C${adjustedRowIndex}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[rsvpStatus === 'yes' ? responseYes : responseNo]],
    },
  });

  await googleSheets.spreadsheets.values.update({
    auth: client,
    spreadsheetId,
    range: `Sheet7!D${adjustedRowIndex}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [[dietaryRestriction]],
    },
  });

  console.log('Guest:', selectedGuest);
  console.log('First Name:', selectedFirstName);
  console.log('RSVP Status:', rsvpStatus);
  console.log('Dietary Restriction:', dietaryRestriction);

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