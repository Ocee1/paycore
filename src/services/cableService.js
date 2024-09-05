const moment = require("moment");
const Cable = require("../models/cableModel");

const createCableLog = async (data) => {
    const result = await Cable.query().insert(data);
    return result;
};

const getCableById = async (id) => {
    const account = await Cable.query().findById(id);
    return account;
};
const getCableByUserId = async (userId) => {
    const result = (await Cable.query().where({ userId }).first());
    return result;
};

const updateCableById = async (id, data) => {
    const result = await Cable.query().patchAndFetchById(id, data);
    return result;
};

const removeCablePurchase = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const account = await Cable.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return account;
};

const getFailedCableSub = async () => {
    const result = await Cable.query().findOne({ status: 11 });
    return result;
};

const updateCableByRef = async (trx_ref, data) => {
    const result = await Cable.query().where('trx_ref', trx_ref).patch(data);
    return result;
};


module.exports = {
    createCableLog,
    getCableById,
    getCableByUserId,
    updateCableById,
    removeCablePurchase,
    getFailedCableSub,
    updateCableByRef
}