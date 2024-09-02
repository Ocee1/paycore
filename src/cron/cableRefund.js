/* eslint-disable no-unused-vars */
const cron = require('node-cron');

const { reversalMail } = require('../mailer');
const { getAccountByUserId, updateByUserId } = require('../services/accountService');
const { createTransaction, findTransactionByIdAndUpdate, updateTransactionByRef } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');
const { updateCableById, getFailedCableSub } = require('../services/cableService');

cron.schedule('* * * * *', async () => {
    console.log('Running cron job to reverse failed cable subscriptions');

    try {
        //Reversal Cron
        //Selecting a transfer with status 11
        const failedCablePurchase = await getFailedCableSub();
        if (!failedCablePurchase) {
            console.log('No failed cable purchase');
            return 'No failed cable Txns'
        }

        //update status to 12 (processing reversal)
        const updateStatus = await updateCableById({ status: 12 }, failedCablePurchase.id );
        if(!updateStatus) {
            console.log("Unable to update Data stats");
            return "Unable to update Data stats"
        }

        //select the account details and the get the current user balance
        const userAccount = await getAccountByUserId(failedCablePurchase.userId);
        const currentBalance = userAccount.balance;

        //add the user balance and the transfer amount to get the new balance of the user (1st bal before, 1st bal after)
        const newBalance = currentBalance + failedCablePurchase.amount;
        const user = await getUserById(failedCablePurchase.userId);
        //log the transaction
        const trxData = {
            userId: user.id,
            type: 'Cable-reversal',
            amount: failedCablePurchase.amount,
            status: 1,
            trx_ref: failedCablePurchase.merchant_ref,
            balanceBefore: currentBalance,
            BalanceAfter: newBalance
        };
        const reverseTrx = await createTransaction(trxData);

        const updatedUserAccount = await updateByUserId(userAccount.userId, newBalance);

        //change the status to failed (2)
        //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
        const updatedTrx = await findTransactionByIdAndUpdate(reverseTrx.id, { status: 3 });
        await updateTransactionByRef(failedCablePurchase.merchant_ref, { status: 2 });
       

        //send a mail to notify user about the reversal

        await reversalMail(user.email, { account_number: userAccount.account_number, amount: newBalance })

        console.log(`Reversed transaction successful!`);

    } catch (error) {
        console.error('Error reversing transactions:', error);
    }
});
