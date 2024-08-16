const cron = require('node-cron');

const { Model } = require('objection');
const Knex = require('knex');
const User = require('../models/user');
const { ATLAS_SECRET, atlasConfig, CREATE_TRANSFER_URL } = require('../config/index');
const axios = require('axios');
const { findAccountByIdAndUpdate, getAccount } = require('../services/accountService');
const Transaction = require('../models/transaction');




cron.schedule('* * * * *', async () => {
  console.log('Checking for pending transfers every minute');

  try {
    const pendingTransactions = await Transaction.query().where({ status: 'pending' });

    for (const transaction of pendingTransactions) {
      const transfer = await Transfer.query().findOne({ transactionId: transaction.id });
      await Transaction.query().patch({ status: 1 }).where({ id: transfer.transactionId });
      const data = {
        transactionType: transfer.transactionType,
        amount: transfer.amount,
        bank: transfer.bank,
        bank_code: transfer.bank_code,
        account_number: transfer.account_number,
        account_name: transfer.account_name,
        narration: transfer.narration,
        reference: transfer.reference,
      }
      const accountRes = await axios(atlasConfig(data, CREATE_TRANSFER_URL, 'post', ATLAS_SECRET));
      if (accountRes.data.status !== 'success') {
        await Transaction.query().patch({ status: 2 }).where({ id: transfer.transactionId });
        await Transfer.query().patch({ status: 2 }).where({ id: transfer.id });
      }
      const txnAccount = await getAccount(account_number);

      if (transactionType === 'debit') {
        
        const balance = txnAccount.balance - amount;
        const account = await findAccountByIdAndUpdate({ balance }, txnAccount.id);
        await Transaction.query().patch({ status: 'completed' }).where({ id: transfer.transactionId });

        console.log(`Processed transaction ID: ${transaction.id}`);
      }
      const balance = txnAccount.balance + amount;
      const account = await findAccountByIdAndUpdate({ balance }, txnAccount.id);
      await Transaction.query().patch({ status: 3 }).where({ id: transfer.transactionId });

      console.log(`Processed transaction ID: ${transaction.id}`);
    }
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
});
