"use strict";

require("core-js/modules/es.promise");

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _nodeUuid = _interopRequireDefault(require("node-uuid"));

var _base64url = _interopRequireDefault(require("base64url"));

var _database = require("./database");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const app = (0, _express.default)();

const httpServer = _http.default.Server(app);

app.use(_bodyParser.default.json());
app.use(_bodyParser.default.urlencoded({
  extended: false
}));
app.use(_express.default.static(`${__dirname}/public`)); // mongoDB接続

(0, _database.connect)();
/**
 * 認証登録チャレンジ発行API
 */

app.post('/api/attestation/challenge', async (req, res) => {
  const id = _nodeUuid.default.v4();

  const userName = req.body.userName;
  const challenge = new _database.ChallengeModel({
    id,
    userName
  });
  await challenge.save();
  res.send(JSON.stringify({
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
  }));
});
/**
 * 認証保存API
 */

app.post('/api/attestation/register', async (req, res) => {
  const credentialId = req.body.id;
  const clientDataJSON = JSON.parse(_base64url.default.decode(req.body.clientDataJSON)); // clientDataJSONのchallenge(登録チャレンジ)からuserNameを探す

  const challenge = await _database.ChallengeModel.findOne({
    id: clientDataJSON.challenge
  });
  const userName = challenge.userName;
  const credential = new _database.CredentialModel({
    id: credentialId,
    userName
  });
  await credential.save();
  res.send(JSON.stringify({
    status: 'ok',
    id: credentialId,
    userName
  }));
});
/**
 * 認証チャレンジ発行API
 */

app.post('/api/assertion/challenge', async (req, res) => {
  const userName = req.body.userName;
  const credential = await _database.CredentialModel.findOne({
    userName
  });
  const credentialId = credential.id;

  const id = _nodeUuid.default.v4();

  const challenge = new _database.ChallengeModel({
    id,
    userName
  });
  await challenge.save();
  res.send(JSON.stringify({
    status: 'ok',
    challenge: id,
    credentialId
  }));
});
/**
 * 認証検証API
 */

app.post('/api/assertion/verify', async (req, res) => {
  const clientDataJSON = JSON.parse(_base64url.default.decode(req.body.clientDataJSON));
  const challenge = await _database.ChallengeModel.findOne({
    id: clientDataJSON.challenge
  });

  if (!challenge) {
    res.status(401).send({
      message: 'clientDataJSON.challenge is Disagreement.'
    });
    return;
  }

  const userName = challenge.userName;
  const credential = await _database.CredentialModel.findOne({
    userName
  });

  if (!credential) {
    res.status(401).send({
      message: 'Authorization failed.'
    });
    return;
  }

  res.send(JSON.stringify({
    status: 'ok',
    clientDataJSON,
    credential
  }));
});
/**
 * 登録済みユーザー名返却API
 */

app.post('/api/users', async (_, res) => {
  const credentials = await _database.CredentialModel.find();
  const result = new Set();
  credentials.forEach(credential => {
    result.add(credential.userName);
  });
  res.send(JSON.stringify({
    users: Array.from(result)
  }));
});
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`http-server ready at http://localhost:${PORT}`);
});