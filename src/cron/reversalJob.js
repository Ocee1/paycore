const cron = require('node-cron');
const Transfer = require('../models/transfer'); 
const Transaction = require('../models/transaction');

cron.schedule('*/10 * * * *', async () => { 
  console.log('Running cron job to reverse failed transactions');

  try {
    const failedTransactions = await Transaction.query().where({
      status: 'failed',
      transactionType: 'debit'  
    });

    for (const transaction of failedTransactions) {
      
      const txn = await Transaction.query().findOne({ id: transaction.id });

      const data = {
        senderId: txn.senderId,
        receiverId: txn.receiverId, 
        amount: txn.amount,
        status: 'reversed', 
        transactionType: 'credit', 
      };

      const reversal = await Transaction.query().insert(data);

      await Transaction.query().patch({ status: 3 }).where({ id: transaction.id });

      console.log(`Reversed transaction ID: ${transaction.id}, created reversal ID: ${reversal.id}`);
    }
  } catch (error) {
    console.error('Error reversing transactions:', error);
  }
});
