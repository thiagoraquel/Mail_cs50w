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
  document.querySelector('#email-detail-view').style.display = 'none';

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
  document.querySelector('#email-detail-view').style.display = 'none';

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
    // 1. Setup the views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    const detailView = document.querySelector('#email-detail-view');
    detailView.style.display = 'block';
    detailView.innerHTML = ''; // Clear previous email content

    // 2. Fetch the email data
    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // 3. Display the email content
        detailView.innerHTML = `
            <div class="email-header">
                <div><strong>From:</strong> ${email.sender}</div>
                <div><strong>To:</strong> ${email.recipients}</div>
                <div><strong>Subject:</strong> ${email.subject}</div>
                <div><strong>Timestamp:</strong> ${email.timestamp}</div>
            </div>
            <hr>
            <div class="email-body">
                ${email.body}
            </div>
        `;

        // 4. Mark email as READ
        // We do this after showing it so it updates on the server
        if (!email.read) {
            fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            });
        }
    });

    fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
        // 1. Exibir os detalhes do e-mail (From, To, Subject, etc.)
        // Adicionei um div vazio para o botão
        detailView.innerHTML = `
            <div class="email-header">
                <div><strong>From:</strong> ${email.sender}</div>
                <div><strong>To:</strong> ${email.recipients}</div>
                <div><strong>Subject:</strong> ${email.subject}</div>
                <div><strong>Timestamp:</strong> ${email.timestamp}</div>
            </div>
            <div id="archive-btn-container" style="margin-top: 10px;"></div>
            <hr>
            <div class="email-body">${email.body}</div>
        `;

        // 2. Lógica do Botão de Arquivar
        // Pegamos o e-mail do usuário logado (geralmente está no H2 do seu HTML)
        const currentUser = document.querySelector('h2').innerText;

        if (email.sender !== currentUser) {
            const btn = document.createElement('button');
            btn.innerHTML = email.archived ? "Unarchive" : "Archive";
            btn.className = email.archived ? "btn btn-sm btn-outline-danger" : "btn btn-sm btn-outline-success";
            
            btn.addEventListener('click', function() {
                // Fazemos o PUT para inverter o status de arquivamento
                fetch(`/emails/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        archived: !email.archived
                    })
                })
                .then(() => {
                    // Após atualizar, carregamos o Inbox novamente
                    load_mailbox('inbox');
                });
            });
            
            document.querySelector('#archive-btn-container').append(btn);
        }

        // 3. Marcar como lido (seu código de PUT que já fizemos antes)
        if (!email.read) {
            fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ read: true })
            });
        }
    });
}