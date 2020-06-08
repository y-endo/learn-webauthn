"use strict";

require("core-js/modules/es.promise");

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _nodeUuid = _interopRequireDefault(require("node-uuid"));

var _mongoose = _interopRequireDefault(require("mongoose"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DB_URL = 'mongodb://localhost:27017';
const DB_NAME = 'attestation';

_mongoose.default.connect(`${DB_URL}/${DB_NAME}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const UserModel = _mongoose.default.model('User', new _mongoose.default.Schema({
  id: String,
  name: String
}, {
  collection: 'user'
}));

const CredentialModel = _mongoose.default.model('CredentialModel', new _mongoose.default.Schema({
  id: String
}, {
  collection: 'credential'
}));

const app = (0, _express.default)();

const httpServer = _http.default.Server(app);

app.use(_bodyParser.default.json());
app.use(_bodyParser.default.urlencoded({
  extended: false
}));
/**
 * 認証登録チャレンジ発行API
 */

app.post('/api/attestation/challenge', async (req, res) => {
  const id = _nodeUuid.default.v4();

  const name = req.body.userName;
  const user = new UserModel({
    id,
    name
  });
  await user.save();
  res.send(JSON.stringify({
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
  }));
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
  res.send(JSON.stringify({
    status: 'ok',
    id
  }));
});
httpServer.listen(3000, () => {
  console.log('http-server ready at http://localhost:3000');
});