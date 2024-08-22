const cron = require('node-cron');

const { Model } = require('objection');
const Knex = require('knex');
const User = require('../models/user');
const { ATLAS_SECRET, atlasConfig, CREATE_TRANSFER_URL, getTransactionFee } = require('../config/index');
const axios = require('axios');
const { findAccountByIdAndUpdate, getAccount, updateByAccount } = require('../services/accountService');
const Transaction = require('../models/transaction');
const Transfer = require('../models/transfer');
const { getTransferById, getTransferByTxnId, findTransferByIdAndUpdate, getPendingTransfers } = require('../services/transferService');
const { findTransactionByIdAndUpdate } = require('../services/transactionService');




cron.schedule('* * * * *', async () => {
  console.log('Checking for pending transfers every minute');

  try {
    // cron transfer

    // Selecting a pending transfer with status 0
    const pendingTransfers = await getPendingTransfers();
    if (!pendingTransfers || pendingTransfers == []) {
      return 'No pending Txns'
    }

    for (const transfer of pendingTransfers) {
      console.log('-----------=== ', pendingTransfers)

      //update transfer status to 1
      // await findTransactionByIdAndUpdate({ status: 1 }, transaction.id);
      await findTransferByIdAndUpdate({ status: 1 }, transfer.id);

      //select the account details and get the current user balance
      const txnAccount = await getAccount(transfer.account_number);
      if (!txnAccount) {
        console.log({
          "status": "error",
          "message": "Account not found"
        }) 
      }
      //get the transfer fee
      const fee = getTransactionFee(txnAccount.balance);

      //check to make sure the user balance can carry the transfer (add the transfer and transfer fee, then check if the user balance is the gotten sum)

      const currentBalance = txnAccount.balance;
      const totalDebit = amount + fee;
      if (currentBalance < totalDebit) {
        console.log({
          "status": "error",
          "message": "Insufficient funds"
        })
      };

      //deduct the transfer amount + fee from user balance, update user balance
      const newBalance = currentBalance - totalDebit;
      const updateAccountBal = await updateByAccount(txnAccount.account_number, newBalance);
      if (!updateAccountBal) {
        console.log({
          "status": "error",
          "message": "Update account balnce failed"
        })
      }

      //Create a transaction for the deduction, also take note of the transfer fee
      const trxData = {
        userId: String(user.id),
        type,
        amount,
        narration,
        status: 0,
        balanceBefore: String(senderAccount.balance),
      };

      const transaction = await createTransaction(trxData);

      //send transfer to atlas
      const accountRes = await axios(atlasConfig(data, CREATE_TRANSFER_URL, 'post', ATLAS_SECRET));

      //if response from atlas is failed, u can update transfer db with status 11(status for initiating reversal)
      if (accountRes.data.status !== 'success') {
        await Transaction.query().patch({ status: 11 }).where({ id: transfer.transactionId });
        await Transfer.query().patch({ status: 11 }).where({ id: transfer.id });
      }

      //if response from atlas is success, u can update transfer db with the atlas reference returned
      const data = {
        amount: transfer.amount,
        bank: transfer.bank,
        bank_code: transfer.bank_code,
        account_number: transfer.account_number,
        account_name: transfer.account_name,
        narration: transfer.narration,
        trx_ref: transfer.reference,
      };
      await Transaction.query().patch({ status: 3 }).where({ id: transfer.transactionId });

      console.log(`Processing transaction \nID: ${transaction.id}`);
    }
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
});
