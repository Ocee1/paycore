const { default: Account } = require("../models/account");



const createAccount = async (data) => {
    const result = await Account.query().insert(data);
    return result;
};

const getAccountById = async (id) => {
    const user = await Account.query().findById(id);
    return user;
}

const getAccountByEmail = async (email) => {
    const user = (await Account.query().where({ email }).first());
    return user;
};

const findAccountByIdAndUpdate = async (data, id) => {
    const user = await Account.query().patchAndFetchById(id, data);
    return user;
};

const removeAccount = async (id) => {
    const user = await Account.query().deleteById(+id);
    return user;
};

module.exports = {
    createAccount,
    getAccountById,
    getAccountByEmail,
    findAccountByIdAndUpdate,
    removeAccount
};