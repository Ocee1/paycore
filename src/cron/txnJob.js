const cron = require('node-cron');

const { Model } = require('objection');
const Knex = require('knex');
const User = require('../models/user');
const { ATLAS_SECRET, atlasConfig, CREATE_TRANSFER_URL, getTransactionFee } = require('../config/index');
const axios = require('axios');
const { findAccountByIdAndUpdate, getAccount, updateByAccount, getAccountByUserId } = require('../services/accountService');
const Transaction = require('../models/transaction');
const Transfer = require('../models/transfer');
const { getTransferById, getTransferByTxnId, findTransferByIdAndUpdate, getPendingTransfers, updateTransferByRef } = require('../services/transferService');
const { findTransactionByIdAndUpdate, createTransaction } = require('../services/transactionService');




cron.schedule('* * * * *', async () => {
  console.log('Checking for pending transfers every minute');

  try {
    // cron transfer

    // Selecting a pending transfer with status 0
    const pendingTransfers = await getPendingTransfers();
    if (!pendingTransfers || pendingTransfers == []) {
      console.log('No pending Txns');
    }

    for (const transfer of pendingTransfers) {
      console.log('-----------=== ', pendingTransfers)

      //update transfer status to 1
      // await findTransactionByIdAndUpdate({ status: 1 }, transaction.id);
      await findTransferByIdAndUpdate({ status: 1 }, transfer.id);

      //select the account details and get the current user balance
      const txnAccount = await getAccountByUserId(transfer.userId);
      if (!txnAccount) {
        console.log({
          "status": "error",
          "message": "Account not found",
        })
      }
      //get the transfer fee
      const fee = getTransactionFee(txnAccount.balance);

      //check to make sure the user balance can carry the transfer (add the transfer and transfer fee, then check if the user balance is the gotten sum)

      const currentBalance = txnAccount.balance;
      const totalDebit = transfer.amount + fee;
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
        userId: String(transfer.userId),
        type: transfer.type,
        amount: transfer.amount,
        narration: transfer.narration,
        status: 1,
        fee: fee,
        balanceBefore: String(txnAccount.balance),
        balanceAfter: String(newBalance)
      };

      const transaction = await createTransaction(trxData);
      if (!transaction) {
        console.log('error ceating trx')
      }

      const data = {
        amount: transfer.amount,
        bank: transfer.bank,
        bank_code: transfer.bank_code,
        account_number: transfer.account_number,
        account_name: transfer.account_name,
        narration: transfer.narration,
        reference: transfer.trx_ref
      }

      //send transfer to atlas
      const accountRes = await axios(atlasConfig(data, CREATE_TRANSFER_URL, 'post', ATLAS_SECRET));

      //if response from atlas is failed, u can update transfer db with status 11(status for initiating reversal)
      if (accountRes.data.status !== 'success') {
        await Transaction.query().patch({ status: 11 }).where({ id: transfer.transactionId });
        await Transfer.query().patch({ status: 11 }).where({ id: transfer.id });
        console.log('error creating transfer on atlas')
      }

      //if response from atlas is success, u can update transfer db with the atlas reference returned
      await updateTransferByRef(trx_ref, {
        meta_data: JSON.stringify(accountRes),
        payment_gateway_ref: accountRes.data.trx_ref,
      });

      console.log(`Processing transaction \nID: ${transaction.id}`);
    }
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
});
