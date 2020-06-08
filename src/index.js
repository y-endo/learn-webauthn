import 'whatwg-fetch';
import base64 from 'base64url';
import base64url from 'base64url';

document.querySelector('.js-button-register').addEventListener('click', requestChallenge);

/**
 * 認証登録チャレンジ発行のリクエストを送る。
 */
async function requestChallenge() {
  const params = {
    userName: document.querySelector('.js-input-user-name').value
  };

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
  console.log(publicKey);

  // 認証データ作成
  const credentials = await navigator.credentials
    .create({ publicKey })
    .then(res => res)
    .catch(err => {
      throw new Error(err);
    });
  console.log(credentials);

  requestRegister(credentials);
}

async function requestRegister(credentials) {
  const params = {
    id: credentials.id,
    attestationObject: base64url(credentials.response.attestationObject),
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
}
