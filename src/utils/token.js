const crypto = require('crypto');
const moment = require('moment');
const Otp = require('../models/otp');
const Token = require('../models/token');
const { saveToken, getToken, getOtp } = require('../services/user.service');
const { AUTH_SECRET } = require('../config');
const momentZone = require("moment-timezone");



const createToken = async (payload) => {

    payload.uniqueId = payload.uniqueId = Date.now();
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('hex');

    const expiresAt = moment().add(60, 'minutes').toISOString().slice(0, 19).replace('T', ' ');
    const token = await `${base64Payload}.${signature}`;

    await console.log('param:', {
        userId: ~~payload.userId,
        token: token,
        expiresAt
    })
    const savedToks = saveToken(payload.userId, token)
    console.log('shiii:  ', savedToks)

    return token;
}

const verifyToken = async (token)=> {
    const [base64Payload, receivedSignature] = token.split('.');

    const expectedSignature = crypto.createHmac('sha256', AUTH_SECRET).update(base64Payload).digest('hex');
    if (expectedSignature !== receivedSignature) {
        return 'Invalid token eh';
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());

    const userToken = await getToken(token);
    console.log('tokaaaaaa: ', userToken)
    if (userToken.token !== token) {
        return 'Invalid token no';
    }
    return payload;
}

const generateOtp = async (userId) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = moment().add(5, 'minutes').toISOString().slice(0, 19).replace('T', ' ');
    

    await Otp.query().insert({
        userId,
        otp: otp.toString(),
        expiresAt
    });

    return otp.toString();
};

const verifyOtp = async (userId, otp) => {
    
    const result = await getOtp(userId, otp);

    // const result = JSON.stringify(otpRecord);
    const expiresAtMoment = moment(result.expiresAt, 'YYYY-MM-DD HH:mm:ss')
    const convertedDatetime = momentZone.utc(result.expiresAt).tz('Africa/Johannesburg').format('YYYY-MM-DD HH:mm:ss');

    if ( moment(convertedDatetime).isBefore(moment())) {
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
}

const saveOtp = async (userId, otp) => {
    

    const expiresAt = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    console.log(expiresAt);

    const userOtp = await Otp.query().insert({ userId, otp, expiresAt });
    return userOtp;
}




module.exports = { createToken, verifyToken, generateOtp, verifyOtp, hashPassword, verifyPassword, saveOtp }