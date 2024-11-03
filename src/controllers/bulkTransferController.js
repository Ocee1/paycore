const { getTransactionFee } = require("../config");
const { checkAccountQueue } = require("../queues/checkAccount/checkAccountQueue");
const { getAccountByUserId } = require("../services/accountService");
const { verifyTransactionPin } = require("../services/transactionService");
const { generateBulkId } = require("../utils/token");

const createBulkTransfer = async (req, res) => {
  try {
    const { transaction_pin, transfers, } = req.body;
    const user = req.user;
    const senderAccount = await getAccountByUserId(user.id);
    if (!senderAccount) {
      return res.status(400).json({
        status: 'fail',
        message: "User account not found"
      })
    };

    if (transfers.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: "No available data for processing"
      });
    }

    // verify Transaction pin
    const verifyPin = await verifyTransactionPin(user.id, transaction_pin);
    if (!verifyPin) return res.status(400).json({ error: { message: "Incorrect transaction pin" } });


    const bulk_transfer_id = generateBulkId();
    let fees = null;
    let total_amount;

    for (const transfer of transfers) {
      const singleTransfer = parseFloat(getTransactionFee(transfer.amount));
      fees += singleTransfer;
      transfer.fee = singleTransfer;
      total_amount += parseFloat(transfer.amount);
    };

    const total_debit_amount = fees + total_amount;

    //check if the total amount is negative, if negative stop the process
    if (total_amount < 0) {
      return res.status(400).json({
        "status": "error",
        "message": "Please enter a valid amount."
      })
    };

    // check each transfer for negative amount
    transfers.forEach(transfer => {
      if (transfer.amount < 0) {
        return res.status(400).json({
          "status": "fail",
          "message": `Enter a valid amount to transfer to account ${transfer.account_number}`
        })
      }
    });

    const currentBalance = senderAccount.balance;

    // check if balance can carry debit
    if (currentBalance <= total_debit_amount) {
      return res.status(400).json({
        "status": "error",
        "message": "Insufficient funds"
      })
    }

    // const ref = generateReference();
    
    // const payload = {
    //   userId: user.id,
    //   type: 'transfer',
    //   amount: total_amount,
    //   status: 0,
    //   fee: fees,
    //   bulk_transfer_id,
    //   trx_ref: ref,
    // };

    // remove txn obj
    // const txn = await createTransaction(payload);
    // if (!txn) {
    //   return res.status(400).json({
    //     status: 'fail',
    //     message: 'Error creating transaction'
    //   })
    // };


    // const redisKey = `transfer:${bulk_transfer_id}`
    // await saveArrayToRedis(redisKey, transfers);

    // send to queue
    // checkAccountQueue.add('checkAccountQueue', { redisKey, bulk_transfer_id, userId: user.id });

    for (let x = 0; x < transfers.length; x++) {
      const transfer = transfers[x];
      checkAccountQueue.add('checkAccountQueue', { transfer, bulk_transfer_id, userId: user.id, transferIndex: x, length:transfers.length });
    };

    res.status(200).json({
      status: 'success',
      message: 'your transaction has beeen scheduled successfully!'
    })
  } catch (error) {
    console.log(`the main error ----- ------ \n ${error}`)
  }
};


module.exports = {
  createBulkTransfer,
}