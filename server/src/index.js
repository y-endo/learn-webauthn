import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import base64url from 'base64url';
import { connect, ChallengeModel, CredentialModel } from './database';

const app = express();
const httpServer = http.Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(`${__dirname}/public`));

// mongoDB接続
connect();

/**
 * 認証登録チャレンジ発行API
 */
app.post('/api/attestation/challenge', async (req, res) => {
  const id = uuid.v4();
  const userName = req.body.userName;

  const challenge = new ChallengeModel({ id, userName });
  await challenge.save();

  res.send(
    JSON.stringify({
      status: 'ok',
      challenge: id,
      rp: {
        name: 'webauthn-sample'
      },
      user: {
        id: userName,
        name: userName,
        displayName: userName
      },
      attestation: 'direct'
    })
  );
});

/**
 * 認証保存API
 */
app.post('/api/attestation/register', async (req, res) => {
  const credentialId = req.body.id;
  const clientDataJSON = JSON.parse(base64url.decode(req.body.clientDataJSON));

  // clientDataJSONのchallenge(登録チャレンジ)からuserNameを探す
  const challenge = await ChallengeModel.findOne({ id: clientDataJSON.challenge });
  const userName = challenge.userName;

  const credential = new CredentialModel({
    id: credentialId,
    userName
  });
  await credential.save();

  res.send(
    JSON.stringify({
      status: 'ok',
      id: credentialId,
      userName
    })
  );
});

/**
 * 認証チャレンジ発行API
 */
app.post('/api/assertion/challenge', async (req, res) => {
  const userName = req.body.userName;

  const credential = await CredentialModel.findOne({ userName });
  const credentialId = credential.id;

  const id = uuid.v4();
  const challenge = new ChallengeModel({ id, userName });
  await challenge.save();

  res.send(
    JSON.stringify({
      status: 'ok',
      challenge: id,
      credentialId
    })
  );
});

/**
 * 認証検証API
 */
app.post('/api/assertion/verify', async (req, res) => {
  const clientDataJSON = JSON.parse(base64url.decode(req.body.clientDataJSON));

  const challenge = await ChallengeModel.findOne({ id: clientDataJSON.challenge });
  if (!challenge) {
    res.status(401).send({ message: 'clientDataJSON.challenge is Disagreement.' });
    return;
  }
  const userName = challenge.userName;

  const credential = await CredentialModel.findOne({ userName });
  if (!credential) {
    res.status(401).send({ message: 'Authorization failed.' });
    return;
  }

  res.send(
    JSON.stringify({
      status: 'ok',
      clientDataJSON,
      credential
    })
  );
});

/**
 * 登録済みユーザー名返却API
 */
app.post('/api/users', async (_, res) => {
  const credentials = await CredentialModel.find();
  const result = new Set();

  credentials.forEach(credential => {
    result.add(credential.userName);
  });

  res.send(
    JSON.stringify({
      users: Array.from(result)
    })
  );
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`http-server ready at http://localhost:${PORT}`);
});
