import base64url from 'base64url';
import { fetchAllUserName } from './utils';

document.querySelector('.js-button-register').addEventListener('click', requestChallenge);

/**
 * 認証登録チャレンジ発行のリクエストを送る。
 */
async function requestChallenge() {
  document.querySelector('.success-message').style.display = 'none';
  document.querySelector('.error-message').style.display = 'none';

  const params = {
    userName: document.querySelector('.js-input-user-name').value
  };
  const users = await fetchAllUserName();

  if (users.includes(params.userName)) {
    alert('既に存在するユーザー名');
    return;
  }

  const response = await fetch('/api/attestation/challenge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(params),
    cache: 'no-cache'
  });
  const json = await response.json();

  createCredential(json);
}

/**
 * 認証登録チャレンジを使って公開鍵を作成、認証機を使ってAttestationを作る
 */
async function createCredential(json) {
  //公開鍵作成、challengeとuser.idはArrayBuffer型
  const publicKey = {
    ...json,
    challenge: base64url.toBuffer(json.challenge).buffer,
    user: {
      ...json.user,
      id: base64url.toBuffer(json.user.id).buffer
    },
    pubKeyCredParams: [
      {
        type: 'public-key',
        alg: -7
      }
    ]
  };
  delete publicKey.status;

  // 認証データ作成
  const credentials = await navigator.credentials
    .create({ publicKey })
    .then(res => res)
    .catch(err => {
      throw new Error(err);
    });

  requestRegister(credentials);
}

async function requestRegister(credentials) {
  const params = {
    id: credentials.id,
    clientDataJSON: base64url(credentials.response.clientDataJSON)
  };

  const response = await fetch('/api/attestation/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(params),
    cache: 'no-cache'
  });
  const json = await response.json();
  console.log(json);

  if (json.status === 'ok') {
    const users = await fetchAllUserName();
    const userNameListItems = users.map(userName => `<li>${userName}</li>`);
    document.querySelector('.js-user-list').innerHTML = userNameListItems.join('');
    document.querySelector('.success-message').style.display = 'block';
  }
}
