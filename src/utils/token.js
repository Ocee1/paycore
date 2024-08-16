const crypto = require('crypto');
const moment = require('moment');
const Otp = require('../models/otp');



function createToken(payload, secret) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');

    return `${base64Payload}.${signature}`;
}

function verifyToken(token, secret) {
    const [base64Payload, receivedSignature] = token.split('.');

    const expectedSignature = crypto.createHmac('sha256', secret).update(base64Payload).digest('hex');
    if (expectedSignature !== receivedSignature) {
        throw new Error('Invalid token');
    }

    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    return payload;
}



const generateOtp = async (userId) => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = moment().add(5, 'minutes').toISOString().slice(0, 19).replace('T', ' ');
    console.log(expiresAt)

    await Otp.query().insert({
        userId,
        otp: otp.toString(),
        expiresAt
    });

    return otp.toString();
};

const verifyOtp = async (userId, otp) => {
    const otpRecord = await Otp.query().findOne({
        userId,
        otp
    });

    if (!otpRecord) {
        return false;
    }

    if (moment(otpRecord.expiresAt).isBefore(moment())) {
        return false;
    }

    await Otp.query().deleteById(otpRecord.id); 

    return true;
};





function hashPassword(password) {
    const salt = 12; 
    const hash = crypto.pbkdf2Sync(password, '12', 1000, 64, `sha512`).toString(`hex`); 
    return {
        hash: hash
    };
}


function verifyPassword(password, hash) {
    const hashToVerify = crypto.pbkdf2Sync(password, '12', 1000, 64, `sha512`).toString(`hex`); 
    return hash === hashToVerify; 
}



module.exports = { createToken, verifyToken, generateOtp, verifyOtp, hashPassword, verifyPassword, }