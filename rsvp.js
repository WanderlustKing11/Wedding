const form = document.getElementById('rsvpForm');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const lastNameInput = document.getElementById('lastName');
    const lastName = lastNameInput.value.trim();

    // Fetch guest data based on last name
    const guestData = await fetchGuestData(lastName);

    if (guestData) {
      const { firstName, address } = guestData;
      const rsvpStatusSelect = document.getElementById('rsvpStatus');
      const rsvpStatus = rsvpStatusSelect.value;

      // Handle the RSVP submission
      const response = await fetch('/rsvp', {
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
    // Fetch guest data logic as mentioned before
}