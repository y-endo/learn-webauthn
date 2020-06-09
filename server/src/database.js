import mongoose from 'mongoose';
import atlasConfig from './atlasConfig';

// const DB_URL = 'mongodb://localhost:27017/webauthn';
const DB_URL = atlasConfig.DB_URL;

export const connect = () => {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  const database = mongoose.connection;
  database.on('error', console.error.bind(console, 'MongoDB 接続エラー'));
  database.once('open', () => console.log('MongoDB 接続'));
  return database;
};

export const ChallengeModel = mongoose.model(
  'Challenge',
  new mongoose.Schema(
    {
      id: String,
      userName: String
    },
    {
      collection: 'challenge'
    }
  )
);
export const CredentialModel = mongoose.model(
  'CredentialModel',
  new mongoose.Schema(
    {
      id: String,
      userName: String
    },
    {
      collection: 'credential'
    }
  )
);
