const { Worker } = require('bullmq');
const { default: Redis } = require('ioredis');
const redisConnection = new Redis({ maxRetriesPerRequest: null });
const { transferQueue } = require('../transfer/transferQueue');

const { generateReference } = require('../../utils/token');
const { default: axios } = require('axios');
const { atlasConfig, GET_ACCOUNT_URL, ATLAS_SECRET } = require('../../config');
const { saveArrayToRedis, addItemToRedisList, getArrayFromRedis } = require('../../utils/helper');
const { bulkInsertTransfers } = require('../../services/transferService');



const connnr = { connection: redisConnection }
const checkAccountWorker = new Worker('checkAccountQueue', async (job) => {
    try {
        const { userId, transfer, bulk_transfer_id, transferIndex, length } = job.data;
        // const userAccount = await getAccountByUserId(userId);

        // const transfers = await getArrayFromRedis(redisKey);
        //

        // verify accounts for each transfer
        // const verifiedTransfers = await Promise.all(
        //     transfers.map(transfer => verifyAccount(transfer))
        // );

        const vAccounts = await verifyAccount(transfer);

        // Filter results for failed and successful verifications
        // let passedVerification;
        // let failedVerification;

        const passedVerificationKey = `passedVerification:${bulk_transfer_id}`
        const failedKey = `failedTranfer:${bulk_transfer_id}`
        if (vAccounts.isValid && transferIndex === 0) {
            await saveArrayToRedis(passedVerificationKey, [vAccounts.transfer]);

        } else if (!vAccounts.isValid && transferIndex === 0) {
            await saveArrayToRedis(failedKey, [vAccounts.transfer]);


        } else if (vAccounts.isValid && transferIndex > 0) {
            await addItemToRedisList(passedVerificationKey, transfer)


        } else {
            await addItemToRedisList(failedKey, transfer)

        }

        if (transferIndex === length - 1) {
            const verifiedTrfs = await getArrayFromRedis(passedVerificationKey)
            const updatedTransfers = verifiedTrfs.map(trf => ({
                ...trf,
                trx_ref: generateReference(),
                status: 0,
                bulk_transfer_id: bulk_transfer_id,
                userId: userId
            }));
            const savedTransfers = await bulkInsertTransfers(updatedTransfers);
            if (!savedTransfers) {
                console.log({
                    status: 'fail',
                    message: 'Error saving transfers to database'
                })
            };
            await transferQueue.add('transferQueue', { bulk_transfer_id, userId, failedKey, passedVerificationKey });
        };

        console.log("Transfers successfully queued");
    } catch (error) {
        console.error('Error interacting with Redis:', error);

    }

}, connnr);

const verifyAccount = async (transfer) => {
    const accountDetails = await verifyAccountAPI(transfer.account_number, transfer.bank_code);
    if (accountDetails.status === 'success') {
        transfer.account_name = accountDetails.data;
    }

    return { transfer, isValid: accountDetails.status == 'success' ? true : false };
};

const verifyAccountAPI = async (account_number, bank_code) => {
    const response = await axios(atlasConfig({ bank: bank_code, account_number: account_number }, GET_ACCOUNT_URL, 'post', ATLAS_SECRET));
    return response.data;
}


module.exports = { checkAccountWorker };
