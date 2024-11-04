/* eslint-disable no-unused-vars */
const cron = require('node-cron');

const { getFailedTransactions, createTransaction, updateTransactionByRef, findTransactions, updateBulkId } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');
const { getAccountByUserId, updateByAccount, updateByUserId } = require('../services/accountService');
const { findTransferByIdAndUpdate, getPendingTransfer, getFailedTransfer } = require('../services/transferService');
const { reversalMail } = require('../mailer');

cron.schedule('*/2 * * * *', async () => {
  console.log('Running cron job to reverse failed transactions');

  try {
    //Reversal Cron
    //Selecting a transfer with status 11

    const failedTransfer = await getFailedTransfer();
    if (!failedTransfer) {
      return 'No failed Txns'
    }

    const user = await getUserById(failedTransfer.userId);
    //update transfer status to 12 (processing reversal)
    await findTransferByIdAndUpdate({ status: 12 }, failedTransfer.id);

    //select the account details and the get the current user balance
    const userAccount = await getAccountByUserId(failedTransfer.userId);
    const currentBalance = userAccount.balance;

    //add the user balance and the transfer amount to get the new balance of the user (1st bal before, 1st bal after)
    const newBalance = currentBalance + failedTransfer.amount;
    let userBalance = newBalance;
    if (failedTransfer.bulk_transfer_id) {
      if (failedTransfer.fee > 0) {
        //if transfer fee exists, 1st bal after becomes 2nd bal before, add 1st bal after to fee amount to get the 2nd bal after
        //log the transaction
        userBalance += failedTransfer.fee;
        // const creditAmount = failedTransfer.amount + failedTransfer.fee;
      };

      const updatedUserAccount = await updateByUserId(userAccount.userId, userBalance);
      let meta_data;
      const pendingTransaction = await findTransactions({ bulk_transfer_id: failedTransfer.bulk_transfer_id });
      meta_data = JSON.parse(pendingTransaction[0].meta_data);
      meta_data.summary.total_amount_reversed += failedTransfer.amount;
      meta_data.summary.total_reversals += 1;
      const updateBulkTransaction = await updateBulkId(failedTransfer.bulk_transfer_id, {
        status: 2,
        meta_data: JSON.stringify(meta_data)
      })

    } else {
      //log the transaction
      const trxData = {
        userId: user.id,
        type: 'reversal',
        amount: failedTransfer.amount,
        status: 1,
        trx_ref: failedTransfer.trx_ref,
        payment_gateway_ref: failedTransfer.payment_gateway_ref,
        balanceBefore: currentBalance,
        BalanceAfter: newBalance
      };
      const reverseTrx = await createTransaction(trxData);


      //user balance is 1st bal after
      let userBalance = newBalance;


      //check if the fee column on the transfer is greater than 0
      if (failedTransfer.fee > 0) {
        //if transfer fee exists, 1st bal after becomes 2nd bal before, add 1st bal after to fee amount to get the 2nd bal after
        //log the transaction
        const secondBalance = userBalance + failedTransfer.fee;
        const creditAmount = failedTransfer.amount + failedTransfer.fee;

        const feeTrx = {
          userId: user.id,
          type: 'reversal',
          amount: failedTransfer.fee,
          status: 1,
          trx_ref: failedTransfer.trx_ref,
          payment_gateway_ref: failedTransfer.payment_gateway_ref,
          balanceBefore: userBalance,
          BalanceAfter: secondBalance
        }
        await createTransaction(feeTrx);
        userBalance += failedTransfer.fee;
      }


      //if transfer fee is greater than 0, user balance is 2nd bal after
      //update the user balance
      const updatedUserAccount = await updateByUserId(userAccount.userId, userBalance);

      //change the status to failed (2)
      //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
      const updatedTrx = await updateTransactionByRef(failedTransfer.trx_ref, { status: 2 });

    }

    //send a mail to notify user about the reversal


    await reversalMail(user.email, { account_number: userAccount.account_number, amount: userBalance })

    console.log(`Reversed transaction successful!`);

  } catch (error) {
    console.error('Error reversing transactions:', error);
  }
});
