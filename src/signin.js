import base64url from 'base64url';
import { fetchAllUserName } from './utils';

document.querySelector('.js-button-login').addEventListener('click', requestChallenge);

async function requestChallenge() {
  document.querySelector('.success-message').style.display = 'none';
  document.querySelector('.error-message').style.display = 'none';

  const params = {
    userName: document.querySelector('.js-input-user-name').value
  };
  const users = await fetchAllUserName();

  if (!users.includes(params.userName)) {
    alert('存在しないユーザー名');
    return;
  }

  const response = await fetch('/api/assertion/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(params),
    cache: 'no-cache'
  });
  const json = await response.json();

  getCredential(json);
}

async function getCredential(json) {
  const publicKey = {
    allowCredentials: [
      {
        transports: ['usb', 'nfc', 'ble', 'internal'],
        type: 'public-key',
        id: base64url.toBuffer(json.credentialId).buffer
      }
    ],
    challenge: base64url.toBuffer(json.challenge).buffer
  };

  const credentials = await navigator.credentials
    .get({ publicKey })
    .then(res => res)
    .catch(err => {
      throw new Error(err);
    });

  requestVerify(credentials);
}

async function requestVerify(credentials) {
  const params = {
    clientDataJSON: base64url(credentials.response.clientDataJSON)
  };

  const response = await fetch('/api/assertion/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(params),
    cache: 'no-cache'
  });
  const json = await response.json();
  console.log(json);

  if (json.status === 'ok') {
    document.querySelector('.success-message').style.display = 'block';
  }
}
