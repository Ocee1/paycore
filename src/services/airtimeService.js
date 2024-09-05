const Airtime = require("../models/airtimeModel");
const moment = require("moment");

const createairtimeLog = async (data) => {
    const result = await Airtime.query().insert(data);
    return result;
};

const getAirtimeById = async (id) => {
    const account = await Airtime.query().findById(id);
    return account;
};
const getAirtimeByUserId = async (userId) => {
    const result = (await Airtime.query().where({ userId }).first());
    return result;
};

const updateAirtimeById = async (data, id) => {
    const result = await Airtime.query().patchAndFetchById(id, data);
    return result;
};

const removeAirtimePurchase = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const account = await Airtime.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return account;
};

const getFailedAirtime = async () => {
    const result = await Airtime.query().findOne({ status: 11 });
    return result;
};

const updateAirtimeByRef = async (trx_ref, data) => {
    const result = await Airtime.query().where('trx_ref', trx_ref).patch(data);
    return result;
};


module.exports = {
    createairtimeLog,
    getAirtimeById,
    getAirtimeByUserId,
    updateAirtimeById,
    removeAirtimePurchase,
    getFailedAirtime,
    updateAirtimeByRef
}