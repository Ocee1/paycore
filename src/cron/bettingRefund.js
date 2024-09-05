/* eslint-disable no-unused-vars */
const cron = require('node-cron');

const { reversalMail } = require('../mailer');
const { getAccountByUserId, updateByUserId } = require('../services/accountService');
const { createTransaction, findTransactionByIdAndUpdate, updateTransactionByRef } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');
const { getFailedBets, updateBetById, updateBetByRef } = require('../services/bettingService');


cron.schedule('* * * * *', async () => {
    console.log('Running cron job to reverse failed cable subscriptions');

    try {
        //Reversal Cron
        //Selecting a transfer with status 11
        const failedBets = await getFailedBets();
        if (!failedBets) {
            console.log('No failed bet transactions');
            return 'No failed bet top-up Txns'
        }

        //update status to 12 (processing reversal)
        const updateStatus = await updateBetById(failedBets.id, { status: 12 } );
        if(!updateStatus) {
            console.log("Unable to update Data stats");
            return "Unable to update Data stats"
        }

        //select the account details and the get the current user balance
        const userAccount = await getAccountByUserId(failedBets.userId);
        const currentBalance = userAccount.balance;

        //add the user balance and the transfer amount to get the new balance of the user (1st bal before, 1st bal after)
        const newBalance = currentBalance + failedBets.amount;
        const user = await getUserById(failedBets.userId);
        //log the transaction
        const trxData = {
            userId: user.id,
            type: 'Bet-reversal',
            amount: failedBets.amount,
            status: 1,
            trx_ref: failedBets.merchant_ref,
            balanceBefore: currentBalance,
            BalanceAfter: newBalance
        };
        const reverseTrx = await createTransaction(trxData);

        const updatedUserAccount = await updateByUserId(userAccount.userId, newBalance);

        //change the status to failed (2)
        //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
        const updatedTrx = await findTransactionByIdAndUpdate(reverseTrx.id, { status: 3 });
        await updateTransactionByRef(failedBets.merchant_ref, { status: 2 });

        await updateBetByRef(failedBets.merchant_ref, { status: 2 });
       

        //send a mail to notify user about the reversal

        await reversalMail(user.email, { account_number: userAccount.account_number, amount: newBalance })

        console.log(`Reversed bet transaction successful!`);

    } catch (error) {
        console.error('Error reversing bet transactions:', error);
    }
});
