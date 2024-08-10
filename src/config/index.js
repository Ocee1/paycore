// import { AxiosRequestConfig } from 'axios';
import dotenv from 'dotenv';
dotenv.config();


export const DEVELOPMENT = process.env.NODE_ENV === 'development';
export const TEST = process.env.NODE_ENV === 'test';

export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
export const LOG_DIR = process.env.LOG_DIR;
export const RMQ_PORT = process.env.RMQ_PORT;
export const NODE_ENV = process.env.NODE_ENV;
export const DATABASE_HOST = process.env.DATABASE_HOST;
export const DATABASE_USER = process.env.DATABASE_USER;
export const DATABASE_NAME = process.env.DATABASE_NAME;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
export const DATABASE_PORT = process.env.PORT;
export const ATLAS_SECRET = process.env.ATLAS_SECRET;
export const CREATE_ACCOUNT_URL = process.env.CREATE_ACCOUNT_URL;
export const GET_ACCOUNT_URL = process.env.GET_ACCOUNT_URL;
export const CREATE_TRANSFER_URL = process.env.CREATE_TRANSFER_URL;

export const atlasConfig = (data, reqUrl, method, secret) => {
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
export const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
  credentials: true,
};


export const SERVER = {
  SERVER_HOSTNAME,
  PORT
}
