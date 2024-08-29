const Transaction = require("../models/transaction");

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


module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionByEmail,
    findTransactionByIdAndUpdate,
    removeTransaction,
    getFailedTransactions,
    updateTransactionByRef,
    updatePendingTrxByRef
}