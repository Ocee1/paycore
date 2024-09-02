const moment = require("moment");
const Electricity = require("../models/electricityModel");

const createElecLog = async (data) => {
    const result = await Electricity.query().insert(data);
    return result;
};

const getElecById = async (id) => {
    const account = await Electricity.query().findById(id);
    return account;
};
const getCableByUserId = async (userId) => {
    const result = (await Electricity.query().where({ userId }).first());
    return result;
};

const updateElecById = async (id, data) => {
    const result = await Electricity.query().patchAndFetchById(id, data);
    return result;
};

const removeElecPurchase = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const result = await Electricity.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return result;
};

const getFailedElect = async () => {
    const result = await Electricity.query().findOne({ status: 11 });
    return result;
};

const getElecByTrxRef = async (ref) => {
    const result = await Electricity.query().findOne({ merchant_ref: ref });
    return result;
};

const getPendingElecBill = async (ref) => {
    const result = await Electricity.query().where({
        status: 1,
        merchant_ref: ref
    });
    return result;
};



module.exports = {
    createElecLog,
    getCableByUserId,
    getElecById,
    updateElecById,
    removeElecPurchase,
    getFailedElect,
    getElecByTrxRef,
    getPendingElecBill
}