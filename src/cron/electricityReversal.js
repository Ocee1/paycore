/* eslint-disable no-unused-vars */
const cron = require('node-cron');

const { getFailedTransactions, createTransaction, updateTransactionByRef } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');
const { getAccountByUserId, updateByAccount, updateByUserId } = require('../services/accountService');
const { findTransferByIdAndUpdate, getPendingTransfer, getFailedTransfer } = require('../services/transferService');
const { reversalMail } = require('../mailer');
const { getFailedElect, updateElecById } = require('../services/electricityService');

cron.schedule('*/2 * * * *', async () => {
    console.log('Running cron job to reverse failed electricity payments');

    try {
        //Reversal Cron
        // get failed electricity payments
        const failedBill = await getFailedElect();
        if (!failedBill) {
            return 'No failed electricity Txns'
        };

        //update bill status to 12 (processing reversal)
        await updateElecById({ status: 12 }, failedBill.id);

        //select the account details and the get the current user balance
        const userAccount = await getAccountByUserId(failedBill.userId);
        const currentBalance = userAccount.balance;
        const newBalance = currentBalance + failedBill.amount;

        //log the transaction
        const trxData = {
            userId: user.id,
            type: 'reversal',
            amount: failedBill.amount,
            status: 1,
            trx_ref: failedBill.trx_ref,
            payment_gateway_ref: failedBill.payment_gateway_ref,
            balanceBefore: currentBalance,
            BalanceAfter: newBalance
        };
        const reverseTrx = await createTransaction(trxData);


        //user balance is 1st bal after
        let userBalance = newBalance;

       
        //update the user balance
        const updatedUserAccount = await updateByUserId(userAccount.userId, userBalance);

        //change the status to failed (2)
        //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
        const updatedTrx = await updateTransactionByRef(failedBill.merchant_ref, { status: 2 });

        //send a mail to notify user about the reversal

        const user = await getUserById(failedBill.userId);
        await reversalMail(user.email, { account_number: userAccount.account_number, amount: userBalance })

        console.log(`Reversed transaction successful!`);

    } catch (error) {
        console.error('Error reversing transactions:', error);
    }
});
