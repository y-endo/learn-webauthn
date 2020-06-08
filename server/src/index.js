import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import uuid from 'node-uuid';
import mongoose from 'mongoose';

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'attestation';

mongoose.connect(`${DB_URL}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserModel = mongoose.model(
  'User',
  new mongoose.Schema(
    {
      id: String,
      name: String
    },
    {
      collection: 'user'
    }
  )
);
const CredentialModel = mongoose.model(
  'CredentialModel',
  new mongoose.Schema(
    {
      id: String
    },
    {
      collection: 'credential'
    }
  )
);

const app = express();
const httpServer = http.Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * 認証登録チャレンジ発行API
 */
app.post('/api/attestation/challenge', async (req, res) => {
  const id = uuid.v4();
  const name = req.body.userName;

  const user = new UserModel({
    id,
    name
  });
  await user.save();

  res.send(
    JSON.stringify({
      status: 'ok',
      challenge: id,
      rp: {
        name: 'webauthn-sample'
      },
      user: {
        id: name,
        name,
        displayName: name
      },
      attestation: 'direct'
    })
  );
});

/**
 * 認証保存API
 */
app.post('/api/attestation/register', async (req, res) => {
  const id = req.body.id;

  const credential = new CredentialModel({
    id
  });
  await credential.save();

  res.send(
    JSON.stringify({
      status: 'ok',
      id
    })
  );
});

httpServer.listen(3000, () => {
  console.log('http-server ready at http://localhost:3000');
});
