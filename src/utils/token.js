const crypto = require('crypto');
const moment = require('moment');
const Otp = require('../models/otp');
const Token = require('../models/token');
const { saveToken, getToken, getOtp, saveOtp } = require('../services/user.service');
const { AUTH_SECRET } = require('../config/index');
const momentZone = require("moment-timezone");




const createToken = async (payload) => {

    payload.uniqueId = payload.uniqueId = Date.now();
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('hex');

    const token = await `${base64Payload}.${signature}`;

    const savedToks = await saveToken(payload.userId, token)

    return token;
}

const verifyToken = async (token) => {
    const [base64Payload, receivedSignature] = token.split('.');

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('hex');
    if (expectedSignature !== receivedSignature) {
        throw new Error('Invalid token');
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

    const userToken = await getToken(token);
    if (!userToken) {
        throw new Error('User ID is missing in the token');
    }

    const expiresAtMoment = moment(userToken.expires_at).format('YYYY-MM-DD HH:mm:ss');
    
    if (moment(expiresAtMoment).isBefore(moment()) || userToken.token !== token) {
        return false;
    }
    return payload;
}

const generateOtp = async (userId) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = moment().add(5, 'minutes').format('YY-MM-DD HH:mm:ss');
    console.log(`====== expires before db ${expiresAt}`)


    const savedOtp = await saveOtp(userId, otp.toString());

    return otp.toString();
};

const verifyOtp = async (userId, otp) => {

    const result = await getOtp(userId, otp);
    if (!result) return false;

    // const result = JSON.stringify(otpRecord);
    const expiresAtMoment = moment(result.expiresAt, 'YYYY-MM-DD HH:mm:ss')

    if (moment(expiresAtMoment).isBefore(moment())) {
        return false;
    }



    // await Otp.query().deleteById(otpRecord.id);

    return true;
};

const hashPassword = (password) => {
    const salt = 12;
    const hash = crypto.pbkdf2Sync(password, '12', 1000, 64, `sha512`).toString(`hex`);
    return {
        hash: hash
    };
}


const verifyPassword = (password, hash) => {
    const hashToVerify = crypto.pbkdf2Sync(password, '12', 1000, 64, `sha512`).toString(`hex`);
    return hash === hashToVerify;
};

function generateReference() {
    let code = '';
    let possible = '0123456789';
    for (let i = 0; i < 16; i++) {
        code += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return code;
};

module.exports = { createToken, verifyToken, generateOtp, verifyOtp, hashPassword, verifyPassword, saveOtp, generateReference }