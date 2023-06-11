import dotenv from 'dotenv';
dotenv.config();

const MONGODB_HOST = process.env.MONGODB_HOST;
const MONGODB_PORT = process.env.MONGODB_PORT;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE;
const MONGODB_USERNAME = process.env.MONGODB_USERNAME;
const MONGODB_PASSWORD = encodeURIComponent(process.env.MONGODB_PASSWORD as string);

const MONGO_DB_URL = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=admin&authMechanism=SCRAM-SHA-256&readPreference=primary&ssl=false`;

export default MONGO_DB_URL;
