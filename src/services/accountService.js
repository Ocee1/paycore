const Account = require("../models/account");
const moment = require("moment");


const createAccount = async (data) => {
    const result = await Account.query().insert(data);
    return result;
};

const getAccountById = async (id) => {
    const account = await Account.query().findById(id);
    return account;
};

const getAccount = async (account_number) => {
    const account = await Account.query().findOne({ account_number });
    return account;
}
const getAccountByUserId = async (userId) => {
    const account = await Account.query().findOne({ userId });
    return account;
}

const getAccountByEmail = async (email) => {
    const account = (await Account.query().where({ email }).first());
    return account;
};

const updateByAccount = async (account_number, data) => {
    const result = await Account.query().where('account_number', account_number).patch({ balance: data });
    return result;
};

const updateByUserId = async (userId, data) => {
    const result = await Account.query().where('userId', userId).patch({ balance: data });
    return result;
};

const findAccountByIdAndUpdate = async (data, id) => {
    const account = await Account.query().patchAndFetchById(id, data);
    return account;
};

const removeAccount = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const account = await Account.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return account;
};

const checkUserBalance = async (amount, id) => {
    const senderAccount = await getAccountByUserId(id); 
    const userBalance = senderAccount.balance;
    const funds =  userBalance > amount;
    return funds;
};


module.exports = {
    createAccount,
    getAccountById,
    getAccountByEmail,
    findAccountByIdAndUpdate,
    removeAccount,
    getAccount,
    updateByAccount,
    getAccountByUserId,
    updateByUserId,
    checkUserBalance,
};