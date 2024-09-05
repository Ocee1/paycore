const moment = require("moment");
const Betting = require("../models/bettingModel");

const createBetLog = async (data) => {
    const result = await Betting.query().insert(data);
    return result;
};

const getBetById = async (id) => {
    const account = await Betting.query().findById(id);
    return account;
};
const getBetByUserId = async (userId) => {
    const result = (await Betting.query().where({ userId }).first());
    return result;
};

const updateBetById = async (id, data) => {
    const result = await Betting.query().patchAndFetchById(id, data);
    return result;
};

const removeBetPurchase = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const account = await Betting.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return account;
};

const getFailedBets = async () => {
    const result = await Betting.query().findOne({ status: 11 });
    return result;
};

const updateBetByRef = async (trx_ref, data) => {
    const result = await Betting.query().where('trx_ref', trx_ref).patch(data);
    return result;
};


module.exports = {
    createBetLog,
    getBetById,
    getBetByUserId,
    updateBetById,
    removeBetPurchase,
    getFailedBets,
    updateBetByRef
}