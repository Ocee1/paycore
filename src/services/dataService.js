const moment = require("moment");
const DataBundle = require("../models/dataModel");

const createDataLog = async (data) => {
    const result = await DataBundle.query().insert(data);
    return result;
};

const getDataById = async (id) => {
    const result = await DataBundle.query().findById(id);
    return result;
};

const getDataByUserId = async (userId) => {
    const result = (await DataBundle.query().where({ userId }).first());
    return result;
};

const updateDataById = async (id, data) => {
    const result = await DataBundle.query().patchAndFetchById(id, data);
    return result;
};

const removeDataBundle = async (id) => {
    const deletedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    const account = await DataBundle.query().patchAndFetchById(+id, { deleted_at: deletedAt });
    return account;
};

const getFailedData = async () => {
    const result = await DataBundle.query().findOne({ status: 11 });
    return result;
}


module.exports = {
    createDataLog,
    getDataById,
    getDataByUserId,
    updateDataById,
    removeDataBundle,
    getFailedData
}