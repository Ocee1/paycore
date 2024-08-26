
const Deposit = require("../models/deposit");


const createDeposit = async (data) => {
    const result = await Deposit.query().insert(data);
    return result;
};

const getDepositBySessionId = async (session_id) => {
    const result = await Deposit.query().findOne({ session_id });
    return result;
}

const getDepositByEmail = async (email) => {
    const result = (await Deposit.query().where({ email }).first());
    return result;
};

const updateDepositById = async (data, id) => {
    const result = await Deposit.query().patchAndFetchById(id, data);
    return result;
};


module.exports = {
    createDeposit,
    getDepositBySessionId,
    getDepositByEmail,
    updateDepositById
}