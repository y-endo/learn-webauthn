"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CredentialModel = exports.ChallengeModel = exports.connect = void 0;

var _mongoose = _interopRequireDefault(require("mongoose"));

var _atlasConfig = _interopRequireDefault(require("./atlasConfig"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const DB_URL = 'mongodb://localhost:27017/webauthn';
const DB_URL = _atlasConfig.default.DB_URL;

const connect = () => {
  _mongoose.default.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const database = _mongoose.default.connection;
  database.on('error', console.error.bind(console, 'MongoDB 接続エラー'));
  database.once('open', () => console.log('MongoDB 接続'));
  return database;
};

exports.connect = connect;

const ChallengeModel = _mongoose.default.model('Challenge', new _mongoose.default.Schema({
  id: String,
  userName: String
}, {
  collection: 'challenge'
}));

exports.ChallengeModel = ChallengeModel;

const CredentialModel = _mongoose.default.model('CredentialModel', new _mongoose.default.Schema({
  id: String,
  userName: String
}, {
  collection: 'credential'
}));

exports.CredentialModel = CredentialModel;