const Otp = require("../models/otp");
const Token = require("../models/token");
const User = require("../models/user");
const moment = require("moment")



const createUser = async (data) => {
    const result = await User.query().insert(data);
    return result;
};

const getUserById = async (id) => {
    const user = await User.query().findById(id);
    return user;
}

const getUserByEmail = async (email) => {
    const user = (await User.query().where({ email }).first());
    return user;
};

const findByIdAndUpdate = async (data, id) => {
    const user = await User.query().patchAndFetchById(id, data);
    return user;
};

const removeUser = async (id) => {
    const user = await User.query().deleteById(+id);
    return user;
};

const saveToken = async (userId, token) => {


    const expiresAt = moment().add(60, 'minutes').format('YYYY-MM-DD HH:mm:ss');
    console.log(`from the DB i/o ============= ${expiresAt}`)

    const authToken = await Token.query().insert({
        userId,
        token,
        expires_at: expiresAt
    });
    return authToken;
};

const updateOtp = async (id, data) => {
    const result = await Otp.query().patchAndFetchById(id, data);
    return result;
};

const getToken = async (token) => {
    const savedToken = await Token.query().findOne({ token });
    return savedToken;
}
const saveOtp = async (userId, otp) => {
    const expiresAt = moment().add(5, 'minutes').format('YYYY-MM-DD HH:mm:ss');

    const userOtp = await Otp.query().insert({ userId, otp, expiresAt });
    return userOtp;
};

const getOtp = async (userId, otp) => {
    const otpRecord = await Otp.query().findOne({
        userId,
        otp
    })
    return otpRecord;
}

module.exports = {
    createUser,
    getUserById,
    getUserByEmail,
    findByIdAndUpdate,
    removeUser,
    saveToken,
    getToken,
    getOtp,
    saveOtp,updateOtp
};