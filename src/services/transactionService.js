const Transaction = require("../models/transaction");
const { getUserById } = require("../services/user.service")
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

const findTransactionByIdAndUpdate = async (id, data) => {
    const user = await Transaction.query().patchAndFetchById(id, data);
    return user;
};

const updateTransactionByRef = async (trx_ref, data) => {
    const result = await Transaction.query().where('trx_ref', trx_ref).patch(data);
    return result;
};

const removeTransaction = async (id) => {
    const user = await Transaction.query().deleteById(+id);
    return user;
};

const getFailedTransactions = async (status, type) => {
    await Transaction.query().where({
        status,
        type
    })
};

const updatePendingTrxByRef = async (trx_ref, data) => {
    const result = await Transaction.query()
    .where('trx_ref', trx_ref)
    .andWhere('status', 1)
    .patch(data);

    return result;
}

const verifyTransactionPin = async (userId, transactionPin) => {
    const user = await getUserById(userId)
    if (!user || !user.transaction_pin) {
        console.log(user)
        throw new Error('Transaction pin not set');
    }

    return (user.transaction_pin === transactionPin);
}

module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionByEmail,
    findTransactionByIdAndUpdate,
    removeTransaction,
    getFailedTransactions,
    updateTransactionByRef,
    updatePendingTrxByRef,
    verifyTransactionPin
}