const cron = require('node-cron');
const { ATLAS_SECRET, atlasConfig, CREATE_TRANSFER_URL,  } = require('../config/index');
const axios = require('axios');
const { updateByAccount, getAccountByUserId } = require('../services/accountService');
const Transaction = require('../models/transaction');
const Transfer = require('../models/transfer');
const { findTransferByIdAndUpdate, updateTransferByRef, getPendingTransfer } = require('../services/transferService');
const { createTransaction } = require('../services/transactionService');




cron.schedule('* * * * *', async () => {
  console.log('Checking for pending transfers every minute');

  try {
    // cron transfer

    // Selecting a pending transfer with status 0
    const pendingTransfer = await getPendingTransfer();
    if (!pendingTransfer) {
      console.log('No pending Txns');
      return "No pending trndfer";
    }

      //update transfer status to 1
      // await findTransactionByIdAndUpdate({ status: 1 }, transaction.id);
      await findTransferByIdAndUpdate({ status: 1 }, pendingTransfer.id);

      //select the account details and get the current user balance
      const txnAccount = await getAccountByUserId(pendingTransfer.userId);
      if (!txnAccount) {
        console.log({
          "status": "error",
          "message": "Account not found",
        })
      }
      //get the transfer fee
      

      //check to make sure the user balance can carry the transfer (add the transfer and transfer fee, then check if the user balance is the gotten sum)

      const currentBalance = txnAccount.balance;
      const totalDebit = pendingTransfer.amount + pendingTransfer.fee;
      if (currentBalance < totalDebit) {
        console.log({
          "status": "error",
          "message": "Insufficient funds"
        })
        return "Insufficient funds";
      };

      //deduct the transfer amount + fee from user balance, update user balance
      const newBalance = currentBalance - totalDebit;
      const updateAccountBal = await updateByAccount(txnAccount.account_number, newBalance);
      if (!updateAccountBal) {
        console.log({
          "status": "error",
          "message": "Update account balnce failed"
        })
        return " Error in updating user account"
      }

      //Create a transaction for the deduction, also take note of the transfer fee

      const trxData = {
        userId: pendingTransfer.userId,
        type: 'transfer',
        amount: pendingTransfer.amount,
        status: 1,
        fee: pendingTransfer.fee,
        trx_ref: pendingTransfer.trx_ref,
        balanceBefore: txnAccount.balance,
        balanceAfter: newBalance
      };

      const transaction = await createTransaction(trxData);
      if (!transaction) {
        console.log('error ceating trx')
        return "Error in creating transaction";
      }

      const data = {
        amount: pendingTransfer.amount,
        bank: pendingTransfer.bank,
        bank_code: pendingTransfer.bank_code,
        account_number: pendingTransfer.account_number,
        account_name: pendingTransfer.account_name,
        narration: pendingTransfer.narration,
        reference: pendingTransfer.trx_ref
      }

      //send transfer to atlas
      const accountRes = await axios(atlasConfig(data, CREATE_TRANSFER_URL, 'post', ATLAS_SECRET));
      console.log('===----===== ::', accountRes)

      //if response from atlas is failed, u can update transfer db with status 11(status for initiating reversal)
      if (accountRes.data.status !== 'success') {
        await Transaction.query().patch({ status: 2 }).where({ id: pendingTransfer.transactionId });
        await Transfer.query().patch({ status: 11 }).where({ id: pendingTransfer.id });
        console.log('error creating transfer on atlas')
      }

      //if response from atlas is success, u can update transfer db with the atlas reference returned
      await updateTransferByRef(pendingTransfer.trx_ref, {
        payment_gateway_ref: accountRes.data.trx_ref,
      });

      console.log(`Processing transaction \nID: ${transaction.id}`);
  } catch (error) {
    console.error('Error processing transactions:', error.message);
  }
});
