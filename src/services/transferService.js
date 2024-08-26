const Transfer = require("../models/transfer");



const createTrf = async (data) => {
    const result = await Transfer.query().insert(data);
    return result;
};

const getTransferById = async (id) => {
    const user = await Transfer.query().findById(id);
    return user;
}
const getTransferByTrxRef = async (ref) => {
    const user = await Transfer.query().findOne({ trx_ref: ref });
    return user;
}

const getTrfBySessionId = async (session_id) => {
    const result = await Transfer.query().findOne({ session_id });
    return result;
}

const getTransferByEmail = async (email) => {
    const user = (await Transfer.query().where({ email }).first());
    return user;
};
const getPendingTransfer = async () => {
    const result = await Transfer.query().findOne({ status: 0 });
    return result;
}
const getFailedTransfer = async () => {
    const result = await Transfer.query().findOne({ status: 11 });
    return result;
}

const findTransferByIdAndUpdate = async (data, id) => {
    const user = await Transfer.query().patchAndFetchById(id, data);
    return user;
};

const updateTransferByRef = async (trx_ref, data) => {
    const result = await Transfer.query().where('trx_rf', trx_ref).patch(data);
    return result;
};

const updatePendingTrfByRef = async (trx_ref, data) => {
    const result = await Transfer.query()
    .where('trx_ref', trx_ref)
    .andWhere('status', 1)
    .patch(data);

    return result;
}




module.exports = {
    createTrf,
    getTransferByEmail,
    getTransferById,
    findTransferByIdAndUpdate,
    getTransferByTrxRef,
    getPendingTransfer,
    updateTransferByRef,
    updatePendingTrfByRef,
    getFailedTransfer,
    getTrfBySessionId
}