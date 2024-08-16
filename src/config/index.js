// import { AxiosRequestConfig } from 'axios';
const dotenv = require('dotenv');
const qs = require('qs');
dotenv.config();


const DEVELOPMENT = process.env.NODE_ENV === 'development';
const TEST = process.env.NODE_ENV === 'test';
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
const SERVER_PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const LOG_DIR = process.env.LOG_DIR;
const RMQ_PORT = process.env.RMQ_PORT;
const NODE_ENV = process.env.NODE_ENV;
const DATABASE_HOST = process.env.DATABASE_HOST;
const DATABASE_USER = process.env.DATABASE_USER;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
const DATABASE_PORT = process.env.DATABASE_PORT;
const ATLAS_SECRET = process.env.ATLAS_SECRET;
const CREATE_ACCOUNT_URL = process.env.CREATE_ACCOUNT_URL;
const GET_ACCOUNT_URL = process.env.GET_ACCOUNT_URL;
const CREATE_TRANSFER_URL = process.env.CREATE_TRANSFER_URL;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
const MAIL_USER = process.env.MAIL_USER;
const MAIL_PORT = process.env.MAIL_PORT;
const MAIL_HOST = process.env.MAIL_HOST;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

const atlasConfig = (data, reqUrl, method, secret) => {
  const accountData = qs.stringify(data);

  var config = {
    method: method,
    url: reqUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${secret}`
    },
    data: data
  };
  return config;
}
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};

module.exports = {
  DEVELOPMENT, 
  DATABASE_HOST, 
  DATABASE_NAME, 
  DATABASE_PASSWORD,
  DATABASE_PORT,
  DATABASE_USER,
  ATLAS_SECRET,
  CREATE_ACCOUNT_URL,
  CREATE_TRANSFER_URL,
  GET_ACCOUNT_URL,
  SERVER_PORT,
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_USER,
  MAIL_HOST,
  NODE_ENV,
  LOG_DIR,
  atlasConfig,
  corsOptions,
  WEBHOOK_SECRET,
  WEBHOOK_URL
}