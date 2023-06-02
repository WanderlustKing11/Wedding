const form = document.getElementById('rsvpForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const lastNameInput = document.getElementById('lastName');
    const lastName = lastNameInput.value.trim(); // In case there are any spaces

    // Fetch guest data based on last name
    const guestData = await fetchGuestData(lastName);

    if (guestData) {
      const { firstName, address } = guestData;
      const rsvpStatusSelect = document.getElementById('rsvpStatus');
      const rsvpStatus = rsvpStatusSelect.value;

      // Handle the RSVP submission
      const response = await fetch('http://localhost:3000/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lastName, rsvpStatus }),
      });

      const data = await response.json();
      console.log(data);

      // Handle the response and display appropriate messages to the user
      // ...
    } else {
      // Guest not found, display an error message
      alert('Guest not found!');
    }
  });

// Function to fetch guest data from Google Sheets
async function fetchGuestData(lastName) {
  const spreadsheetId = process.env.SSID;
  const range = 'Wedding Guests!A2:B'; // Last Name starts column A, row 2
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const values = response.data.values;
  
  // Find the matching guest based on last name
  const guest = values.find(row => row[0] === lastName);
  
  if (guest) {
    const lastName = guest;
    return { lastName };
  } else {
    return null; // Guest not found
  }
}