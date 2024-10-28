const Transfer = require("../models/transfer");
const { updateBulkId } = require("./transactionService");



const createTrf = async (data) => {
    const result = await Transfer.query().insert(data);
    return result;
};

const getTransferById = async (id) => {
    const user = await Transfer.query().findById(id);
    return user;
};

const bulkInsertTransfers = async (data) => {
    const result = await Transfer.query().insertGraph(data);
    return result;
}
const getTransferByTrxRef = async (ref) => {
    const user = await Transfer.query().findOne({ trx_ref: ref });
    return user;
}

const getPendingBulkTransfers = async (data) => {
    const user = await Transfer.query().findOne(data);
    return user;
};

const getAllPendingBulkTransfers = async (data) => {
    const user = await Transfer.query().where({
        status: 0,
        bulk_transfer_id: data
    });
    return user;
};

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
};

const getFailedTransfer = async () => {
    const result = await Transfer.query().findOne({ status: 11 });
    return result;
};

const findTransferByIdAndUpdate = async (data, id) => {
    const user = await Transfer.query().patchAndFetchById(id, data);
    return user;
};

const updateTransferByRef = async (trx_ref, data) => {
    const result = await Transfer.query().where('trx_ref', trx_ref).patch(data);
    return result;
};

const updatePendingTrfByRef = async (trx_ref, data) => {
    const result = await Transfer.query()
    .where('trx_ref', trx_ref)
    .andWhere('status', 1)
    .patch(data);

    return result;
};

const checkForBulkAndUpdateStatus = async (bulk_transfer_id) => {
    const bulkTransfers = await Transfer.query().where({ bulk_transfer_id });
    
    const allCompleted = bulkTransfers.every(transfer => transfer.status === 3);

    if (!allCompleted) {
        console.log('Not all transactions are completed (status !== 3). Ending operation.');
        return false; 
    }

    try {
        const result = await updateBulkId(bulk_transfer_id, { status: 3 });

        console.log(`Transaction updated successfully, result: ${result}`);
        return result;
    } catch (error) {
        console.error('Error updating transaction:', error);
    }
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
    getTrfBySessionId,
    getPendingBulkTransfers,
    checkForBulkAndUpdateStatus,
    getAllPendingBulkTransfers,
    bulkInsertTransfers
}