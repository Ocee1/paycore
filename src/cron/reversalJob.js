const cron = require('node-cron');
const Transfer = require('../models/transfer');
const Transaction = require('../models/transaction');
const { getFailedTransactions, getTransactionById, createTransaction, findTransactionByIdAndUpdate, updateTransactionByRef } = require('../services/transactionService');
const { getUserById } = require('../services/user.service');
const { getAccountByUserId, updateByAccount } = require('../services/accountService');
const { getPendingTransfers, findTransferByIdAndUpdate } = require('../services/transferService');
const { reversalMail } = require('../mailer');

cron.schedule('*/10 * * * *', async () => {
  console.log('Running cron job to reverse failed transactions');

  try {
    //Reversal Cron
    //Selecting a transfer with status 11
    const failedTransfers = await getPendingTransfers(11, 'transfer');

    //update transfer status to 12 (processing reversal)
    for (const transfer of failedTransfers) {
      await findTransferByIdAndUpdate({status: 12}, transfer.id);

      //select the account details and the get the current user balance
      const userAccount = await getAccountByUserId(transfer.userId);
      const currentBalance = userAccount.balance;

      //add the user balance and the transfer amount to get the new balance of the user (1st bal before, 1st bal after)
      const newBalance = currentBalance + transfer.amount;

      //log the transaction
      const trxData = {
        userId: String(user.id),
        type: 'reversal',
        amount: transfer.amount,
        status: 1,
        trx_ref: transfer.trx_ref,
        payment_gateway_ref: transfer.payment_gateway_ref,
        balanceBefore: String(currentBalance),
        BalanceAfter: newBalance
      };

      //user balance is 1st bal after
      let userBalance = newBalance;

      //check if the fee column on the transfer is greater than 0
      if (transfer.fee > 0) {
        //if transfer fee exists, 1st bal after becomes 2nd bal before, add 1st bal after to fee amount to get the 2nd bal after
        //log the transaction
        const secondBalance = userBalance + transfer.fee;
        const creditAmount = transfer.amount + transfer.fee;
        const feeTrx = {
          userId: String(user.id),
          type: 'reversal',
          amount: creditAmount,
          status: 1,
          trx_ref: transfer.trx_ref,
          payment_gateway_ref: transfer.payment_gateway_ref,
          balanceBefore: String(currentBalance),
          BalanceAfter: newBalance
        }
        await createTransaction(feeTrx);
        userBalance += transfer.fee; 
      }
      
      
      //if transfer fee is greater than 0, user balance is 2nd bal after
      //update the user balance
      const updatedUserAccount = await updateByAccount(userAccount.account_number, userBalance);

      //change the status to failed (2)
      //you can use the trx_ref to get the main transaction for the transfer and update to failed (2)
      const updatedTrx = await updateTransactionByRef(transfer.trx_ref, { status: 2 });
      
      //send a mail to notify user about the reversal

      const user = await getUserById(transfer.userId);
      await reversalMail(user.email, { account_number: userAccount.account_number, amount: userBalance })
      
      console.log(`Reversed transaction successful!`);
    }
    
    const failedTransactions = await getFailedTransactions(11, 'transfer');
    if (!failedTransactions) {
      return 'No failed Txns'
    }


  } catch (error) {
    console.error('Error reversing transactions:', error);
  }
});
