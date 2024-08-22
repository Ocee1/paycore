// import { AxiosRequestConfig } from 'axios';
const dotenv = require('dotenv');
const qs = require('qs');
dotenv.config();


const DEVELOPMENT = process.env.NODE_ENV === 'development';
const TEST = process.env.NODE_ENV === 'test';
const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';

const LOG_DIR = process.env.LOG_DIR;

const DATABASE_USER = "root"
const DATABASE_PASSWORD = "10101010"
const DATABASE_NAME = "txn-db"
const DATABASE_HOST = "127.0.0.1"
const DATABASE_PORT = 3306
const PORT = 4000
const ATLAS_SECRET = 'RVSEC-7f9932303f6a1cfa98f8c7e4e7185cf5e2f7bcd81dead017b52f60dc31cecf7da4c3f7f53e7347f7b9b559dfbc0c9abf-1722870798301'
const CREATE_ACCOUNT_URL = "https://integrations.getravenbank.com/v1/pwbt/generate_account"
const GET_ACCOUNT_URL = "https://integrations.getravenbank.com/v1/account_number_lookup"
const CREATE_TRANSFER_URL = " https://integrations.getravenbank.com/v1/transfers/create"
const MAIL_PASSWORD = "055817da189e50"
const MAIL_USER = "d31991ec8a217d"
const MAIL_PORT = 587
const MAIL_HOST =" sandbox.smtp.mailtrap.io"
const WEBHOOK_SECRET = "2e344a1c59ce7b1200eacfb93d0f8e2085c8c5660347b749a7d13e5835803606"
const WEBHOOK_URL = "https://integrations.getravenbank.com/v1/webhooks/update"
const AUTH_SECRET = "017b52f60dc31cecf7da4c3f7f53e7347f7b9b559dfbc0c9abf-1722870798301"

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