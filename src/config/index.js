// import { AxiosRequestConfig } from 'axios';
const dotenv = require('dotenv');
const qs = require('qs');
const { envConfig } = require('./base');
dotenv.config();


const DEVELOPMENT = process.env.NODE_ENV === envConfig.DEVELOPMENT;
const TEST = process.env.NODE_ENV === 'test';
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || envConfig.SERVER_HOSTNAME;

const LOG_DIR = process.env.LOG_DIR || envConfig.LOG_DIR;

const DATABASE_USER = process.env.DATABASE_USER || envConfig.DATABASE_USER
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || envConfig.DATABASE_PASSWORD
const DATABASE_NAME = process.env.DATABASE_NAME || envConfig.DATABASE_NAME
const DATABASE_HOST = process.env.DATABASE_HOST || envConfig.DATABASE_HOST
const DATABASE_PORT = process.env.DATABASE_PORT || envConfig.DATABASE_PORT
const PORT = process.env.PORT || envConfig.PORT
const ATLAS_SECRET = process.env.ATLAS_SECRET || envConfig.ATLAS_SECRET;
const CREATE_ACCOUNT_URL = process.env.CREATE_ACCOUNT_URL || envConfig.CREATE_ACCOUNT_URL
const GET_ACCOUNT_URL = process.env.GET_ACCOUNT_URL || envConfig.GET_ACCOUNT_URL
const CREATE_TRANSFER_URL = process.env.CREATE_TRANSFER_URL || envConfig.CREATE_TRANSFER_URL;
const MAIL_PASSWORD = process.env.MAIL_PASSWORD  || envConfig.MAIL_PASSWORD
const MAIL_USER = process.env.MAIL_USER || envConfig.MAIL_USER
const MAIL_PORT = process.env.MAIL_PORT || envConfig.MAIL_PORT
const MAIL_HOST = envConfig.MAIL_HOST|| process.env.MAIL_HOST;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || envConfig.WEBHOOK_SECRET
const WEBHOOK_URL = process.env.WEBHOOK_URL || envConfig.WEBHOOK_URL
const AUTH_SECRET = process.env.AUTH_SECRET || envConfig.AUTH_SECRET

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

const transactionFees = {
  '50001': 53.75,
  '0_5000': 10.75,
  '5001_50000': 26.88
};

const getTransactionFee = (amount) => {
  if (amount > 50000) {
      return transactionFees["50001"];
  } else if (amount >= 5001 && amount <= 50000) {
      return transactionFees["5001_50000"];
  } else if (amount >= 0 && amount <= 5000) {
      return transactionFees["0_5000"];
  } else {
      throw new Error("Invalid amount");
  }
}

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
  MAIL_PASSWORD,
  MAIL_PORT,
  MAIL_USER,
  MAIL_HOST,
  LOG_DIR,
  atlasConfig,
  corsOptions,
  WEBHOOK_SECRET,
  WEBHOOK_URL,
  AUTH_SECRET,
  getTransactionFee
}