const Account = require("../models/account");



const createAccount = async (data) => {
    const result = await Account.query().insert(data);
    return result;
};

const getAccountById = async (id) => {
    const account = await Account.query().findById(id);
    return account;
};

const getAccount = async (account_number) => {
    const accoint = await Account.query().findOne({ account_number });
    return account;
}

const getAccountByEmail = async (email) => {
    const account = (await Account.query().where({ email }).first());
    return account;
};

const findAccountByIdAndUpdate = async (data, id) => {
    const account = await Account.query().patchAndFetchById(id, data);
    return account;
};

const removeAccount = async (id) => {
    const account = await Account.query().deleteById(+id);
    return account;
};

module.exports = {
    createAccount,
    getAccountById,
    getAccountByEmail,
    findAccountByIdAndUpdate,
    removeAccount,
    getAccount
};