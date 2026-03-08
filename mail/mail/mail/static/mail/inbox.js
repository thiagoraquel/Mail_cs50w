console.log("THE SCRIPT HAS LOADED!");
alert("If you see this, JS is working!");

document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Handle the Compose Form Submission
  document.querySelector('#compose-form').onsubmit = (event) => {
    event.preventDefault();

    console.log("Submit button clicked! The JavaScript is alive!");
    
    const recipient = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    console.log(`Sending to: ${recipient}, Subject: ${subject}`);

    send_email(recipient, subject, body);
  };
}

function load_mailbox(mailbox) {
  
  // 1. Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // 2. Show the mailbox name
  const view = document.querySelector('#emails-view');
  view.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // 3. Fetch emails for this mailbox
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // 4. Loop through emails and create a row for each
      emails.forEach(email => {
          const element = document.createElement('div');
          
          // Add CSS classes for styling (we'll define these next)
          element.classList.add('email-row');
          if (email.read) {
              element.classList.add('read');
          }

          // 5. Build the inner HTML of the row
          element.innerHTML = `
              <span class="sender"><strong>${email.sender}</strong></span>
              <span class="subject">${email.subject}</span>
              <span class="timestamp">${email.timestamp}</span>
          `;

          // 6. Add a click event to view the email (We'll build view_email later)
          element.addEventListener('click', function() {
              console.log('This element has been clicked!');
              view_email(email.id);
          });

          view.append(element);
      });
  });
}

function send_email(recipient, subject, body) {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipient,
        subject: subject,
        body: body
    })
  })
  .then(response => {
    // Check if the server actually accepted the email (Status 201)
    if (response.status === 201) {
        return response.json();
    } else {
        // If it failed, throw an error to the .catch block
        return response.json().then(data => {
            throw new Error(data.error || 'Something went wrong');
        });
    }
  })
  .then(result => {
      console.log('Success:', result);
      load_mailbox('sent'); // ONLY redirect on success
  })
  .catch(error => {
      // This will now show you EXACTLY why the DB is empty
      alert(error.message); 
      console.error('Error:', error);
  });
}

function view_email(id) {
    // For now, let's just make sure it works
    console.log(`Viewing email with ID: ${id}`);
    
    // Hide mailbox, show a "view" div (you might need to add this to your HTML)
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    
    // Logic to fetch and display single email goes here...
}