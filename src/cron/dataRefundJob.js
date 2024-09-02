/* eslint-disable no-unused-vars */
const cron = require('node-cron');

const { reversalMail } = require('../mailer');
const { getFailedData, updateDataById } = require('../services/dataService');
const { getAccountByUserId, updateByUserId } = require('../services/accountService');
const { createTransaction, findTransactionByIdAndUpdate, updateTransactionByRef } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');

cron.schedule('* * * * *', async () => {
    console.log('Running cron job to reverse failed Data purchases');

    try {
        //Reversal Cron
        //Selecting a transfer with status 11
        const failedDataPurchase = await getFailedData();
        if (!failedDataPurchase) {
            console.log('No failed data purchase');
            return 'No failed Txns'
        }

        //update status to 12 (processing reversal)
        const updateStat = await updateDataById(failedDataPurchase.id, { status: 12 });
        if(!updateStat) {
            console.log("Unable to update Data stats");
            return "Unable to update Data stats"
        }

        //select the account details and the get the current user balance
        const userAccount = await getAccountByUserId(failedDataPurchase.userId);
        const currentBalance = userAccount.balance;

        //add the user balance and the transfer amount to get the new balance of the user (1st bal before, 1st bal after)
        const newBalance = currentBalance + failedDataPurchase.amount;
        const user = await getUserById(failedDataPurchase.userId);
        //log the transaction
        const trxData = {
            userId: user.id,
            type: 'Data reversal',
            amount: failedDataPurchase.amount,
            status: 1,
            trx_ref: failedDataPurchase.merchant_ref,
            balanceBefore: currentBalance,
            BalanceAfter: newBalance
        };
        const reverseTrx = await createTransaction(trxData);

        const updatedUserAccount = await updateByUserId(userAccount.userId, newBalance);

        //change the status to failed (2)
        //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
        const updatedTrx = await findTransactionByIdAndUpdate(reverseTrx.id, { status: 3 });
        await updateTransactionByRef(failedDataPurchase.merchant_ref, { status: 2 });
       

        //send a mail to notify user about the reversal

        await reversalMail(user.email, { account_number: userAccount.account_number, amount: newBalance })

        console.log(`Reversed transaction successful!`);

    } catch (error) {
        console.error('Error reversing transactions:', error);
    }
});
