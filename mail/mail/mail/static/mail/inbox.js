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
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
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