const { Worker } = require('bullmq');
const axios = require('axios');
const { default: Redis } = require('ioredis');
const { atlasConfig, CREATE_TRANSFER_URL, ATLAS_SECRET } = require('../../config');
const {  updateTransferByRef, findTransferByIdAndUpdate, getAllPendingBulkTransfers } = require('../../services/transferService');
const { findTransactions, createTransaction, updateBulkId } = require('../../services/transactionService');
const { getAccountByUserId, updateByAccount, checkUserBalance } = require('../../services/accountService');
const { getArrayFromRedis } = require('../../utils/helper');
const redisConnection = new Redis({ maxRetriesPerRequest: null });
// const { performTransfer } = require('../../services/transferService');

const connectio = { connection: redisConnection }

const transferWorker = new Worker('transferQueue', async (job) => {
    const { bulk_transfer_id, userId, failedKey, passedVerificationKey } = job.data;


    try {
        // fetch pending transfers
        const pendingTransfers = await getAllPendingBulkTransfers(bulk_transfer_id);
        if (!pendingTransfers) {
            console.log({
                status: 'fail',
                message: 'No pending transfer for this bulk id'
            })
            return "Failed to fetch pending transactions"
        };

        const sentTransfers = await getArrayFromRedis(passedVerificationKey);
        const failedTransfers = await getArrayFromRedis(failedKey);


        
        const isExisting = await findTransactions({bulk_transfer_id});
        if (isExisting.length > 0) {
            console.log({
                status: 'fail',
                message: `No transaction with bulk id ${bulk_transfer_id} already exists.`
            })
            return "Failed to process transactions"
        };
        

        const { totalAmount, totalFees } = pendingTransfers.reduce((acc, transfer) => {
            acc.totalAmount += transfer.amount;
            acc.totalFees += transfer.fee;
            return acc;
        }, { totalAmount: 0, totalFees: 0 });

        const totalDebit = totalAmount + totalFees;

        
        const senderAccount = await getAccountByUserId(userId);
        const currentBalance = senderAccount.balance;
        const hasFunds = await checkUserBalance(totalDebit, userId);
        if (!hasFunds) {
            console.log({
                "status": "error",
                "message": "Insufficient funds"
            });
            return `User with id: ${userId} has insufficient funds.`
        };

        const meta_data = {
            bulk_transfer_id,
            summary: {
                total_sent: sentTransfers.length,
                total_failed: failedTransfers.length,
                total_amount: totalDebit,
                passedVerificationDetails: sentTransfers.map(transfer => ({
                    accountNumber: transfer.accountNumber,
                    amount: transfer.amount,
                })),
                failedVerificationDetails: failedTransfers.map(transfer => ({
                    transferId: transfer.id,
                    accountNumber: transfer.accountNumber,
                    error: "Failed account verification",
                })),
            }
        };

        //deduct the transfer amount + fee from user balance, update user balance
        const newBalance = currentBalance - totalDebit;
        const updateAccountBal = await updateByAccount(senderAccount.account_number, newBalance);
        if (!updateAccountBal) {
            console.log({
                "status": "error",
                "message": "Update account balance failed"
            })
            return " Error in updating user account"
        };

        const trxData = {
            userId: userId,
            type: 'bulk_transfer',
            amount: totalDebit,
            status: 1,
            fee: totalFees,
            meta_data: JSON.stringify(meta_data),
            bulk_transfer_id,
            balanceBefore: senderAccount.balance,
            balanceAfter: newBalance
        };

        const transaction = await createTransaction(trxData);
        if (!transaction) {
            console.log('error ceating trx')
            return "Error in creating transaction";
        }

        for (const transfer of pendingTransfers) {
            await findTransferByIdAndUpdate({ status: 1 }, transfer.id);
            const data = {
                amount: transfer.amount,
                bank: transfer.bank,
                bank_code: transfer.bank_code,
                account_number: transfer.account_number,
                account_name: transfer.account_name,
                narration: transfer.narration,
                reference: transfer.trx_ref,
                currency: 'NGN'
            };

            const accountRes = await axios(atlasConfig(data, CREATE_TRANSFER_URL, 'post', ATLAS_SECRET));
            if (accountRes.data.status !== 'success') {
                // await Transaction.query().patch({ status: 2 }).where({ id: transfer.transactionId });
                // await Transfer.query().patch({ status: 11 }).where({ id: pendingTransfer.id });
                await updateBulkId(bulk_transfer_id, { status: 2 });
                await findTransferByIdAndUpdate({ status: 11 }, transfer.id);
                console.log('error creating transfer on atlas');
                return 'error creating transfer on atlas'
            }
            await updateTransferByRef(transfer.trx_ref, {
                payment_gateway_ref: accountRes.data.data.trx_ref,
            });
        }


        


        console.log('transaction is being processed')

    } catch (error) {
        console.error('Error performing transactions', error);
    }
}, connectio);


module.exports = { transferWorker };