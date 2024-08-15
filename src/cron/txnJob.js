import cron from 'node-cron'

import { Model } from 'objection';
import Knex from 'knex';
import User from '../models/user';
import { Transaction } from '../models/transactions';
import { ATLAS_SECRET, atlasConfig, CREATE_TRANSFER_URL } from '../config/config';
import axios from 'axios';



cron.schedule('* * * * *', async () => {
  console.log('Checking for pending transfers every minute');

  try {
    const pendingTransactions = await Transaction.query().where({ status: 'pending'});

    for (const transaction of pendingTransactions) {
      const transfer = await Transfer.query().findOne({ transactionId: transaction.id });
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
        await Transaction.query().patch({ status: 'failed' }).where({ id: transfer.transactionId });
        // await Transfer.query().patch({ status: 'failed' }).where({ id: transfer.id });
      }

      await Transaction.query().patch({ status: 'completed' }).where({ id: transfer.transactionId });

      console.log(`Processed transaction ID: ${transaction.id}`);
    }
  } catch (error) {
    console.error('Error processing transactions:', error);
  }
});
