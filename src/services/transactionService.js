const Transaction = require("../models/transaction");
const Webhook = require("../models/webHook");


const createTransaction = async (data) => {
    const result = await Transaction.query().insert(data);
    return result;
};

const getTransactionById = async (id) => {
    const user = await Transaction.query().findById(id);
    return user;
}

const getTransactionByEmail = async (email) => {
    const user = (await Transaction.query().where({ email }).first());
    return user;
};

const findTransactionByIdAndUpdate = async (data, id) => {
    const user = await Transaction.query().patchAndFetchById(id, data);
    return user;
};

const removeTransaction = async (id) => {
    const user = await Transaction.query().deleteById(+id);
    return user;
};




module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionByEmail,
    findTransactionByIdAndUpdate,
    removeTransaction,
}