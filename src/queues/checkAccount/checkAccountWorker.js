const { Worker } = require('bullmq');
const { default: Redis } = require('ioredis');
const redisConnection = new Redis({ maxRetriesPerRequest: null });
const { transferQueue } = require('../transfer/transferQueue');

const { generateReference } = require('../../utils/token');
const { default: axios } = require('axios');
const { atlasConfig, GET_ACCOUNT_URL, ATLAS_SECRET } = require('../../config');
const { getArrayFromRedis, saveArrayToRedis } = require('../../utils/helper');
const { bulkInsertTransfers } = require('../../services/transferService');



const connnr = { connection: redisConnection }
const checkAccountWorker = new Worker('checkAccountQueue', async (job) => {
    try {
        const { userId, redisKey, bulk_transfer_id } = job.data;
        // const userAccount = await getAccountByUserId(userId);

        const transfers = await getArrayFromRedis(redisKey);
        
        // verify accounts for each transfer
        const verifiedTransfers = await Promise.all(
            transfers.map(transfer => verifyAccount(transfer))
        );
        
        // Filter results for failed and successful verifications
        const passedVerification = verifiedTransfers.filter(transfer => transfer.isValid);
        const failedVerification = verifiedTransfers.filter(transfer => !transfer.isValid);
        
        if (failedVerification.length > 0) {
            console.log('Some transfers failed verification:', failedVerification);
        } else {
            console.log('All transfers passed verification:', passedVerification);
        }

        const newVerifiedArray = passedVerification.map(trf => {
            trf.transfer.trx_ref = generateReference();
            trf.transfer.status = 0;
            trf.transfer.bulk_transfer_id = bulk_transfer_id;
            trf.transfer.userId = userId;
        
            return trf.transfer; // Return the modified transfer object
        });

        // add failed and successful verification to redis
        const failedKey = `failedTranfer:${bulk_transfer_id}`
        const passedVerificationKey = `passedVerification:${bulk_transfer_id}`
        await saveArrayToRedis(failedKey, failedVerification);
        await saveArrayToRedis(passedVerificationKey, passedVerification);

        // console.log(`passedd verification tfssss:   ${newVerifiedArray}`)
        // bulk save succesfully verified transfers 
        const savedTransfers = await bulkInsertTransfers(newVerifiedArray);
        if (!savedTransfers) {
            console.log({
                status: 'fail',
                message: 'Error saving transfers to database'
            })
        };
        
        await transferQueue.add('transferQueue', { bulk_transfer_id, userId, failedKey, passedVerificationKey });

        console.log("Transfers successfully queued");
    } catch (error) {
        console.error('Error interacting with Redis:', error);

    }

}, connnr);

const verifyAccount = async (transfer) => {
    const accountDetails = await verifyAccountAPI(transfer.account_number, transfer.bank_code);
    if (accountDetails.status === 'success') {
        transfer.account_name = accountDetails.data;
    };

    return { transfer, isValid: accountDetails.status == 'success' ? true : false };
};

const verifyAccountAPI = async (account_number, bank_code) => {
    const response = await axios(atlasConfig({ bank: bank_code, account_number: account_number }, GET_ACCOUNT_URL, 'post', ATLAS_SECRET));
    return response.data;
}


module.exports = { checkAccountWorker };
