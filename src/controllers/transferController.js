const { GET_ACCOUNT_URL, ATLAS_SECRET, atlasConfig } = require("../config");
const validate = require("../validation/transactionValidation");
const { getUserById, } = require("../services/user.service");
const Transaction = require("../models/transaction");
const { createTransaction, } = require("../services/transactionService");
const axios = require("axios");
const { getAccountByUserId } = require("../services/accountService");
const Transfer = require("../models/transfer");
const { generateReference } = require("../utils/token");



const createTransfer = async (req, res) => {
    const { body, user } = req;
    const { amount, type, transactionPin, account_number, bank, bank_code, narration, currency} = body;

    try {
        //data => amount, bank_code, bank_name, account_number, account_name, narrations, currency
        //validate the data above
        const { error } = validate(body);
        if (error) {
            console.log(error)
            return res.status(400).json({ error: 'Bad request' });
        }

        const senderAccount = await getAccountByUserId(user.id);
        // verify Trx pin
        const verifyPin = await verifyTransactionPin(user.id, transactionPin);
        if (!verifyPin) return res.status(400).json({ error: { message: "Incorrect transaction pin" } });

        //check if the amount is negative, if negative stop the process
        if (senderAccount.balance < 0) {
            return res.status(400).json({
                "status": "error",
                "message": "Insufficient balance. Your account balance is negative."
              })
        }

        //validate the account number
        const accountInfo = await axios(atlasConfig({ bank: bank_code, account_number: account_number }, GET_ACCOUNT_URL, 'post', ATLAS_SECRET));
        if (accountInfo.data.status !== 'success') return res.status(400).json(
            {
                "status": "error",
                "message": "Account not found" 
            });

        //select the account details and the get the current user balance
        const currentBalance = senderAccount.balance;

        //check to make sure the user balance can carry the transfer
        if (currentBalance < amount) return res.status(400).json({ error: { message: "Insufficient funds" } });

        //generate a trx_ref (transaction reference)
        const trx_ref = generateReference();

        //save the transfer on the transfer table, with status 0

        const payload = {
            trx_ref: trx_ref,
            userId: String(user.id),
            status: 0,
            amount: amount,
            bank: bank,
            bank_code: bank_code,
            account_number: account_number,
            account_name: accountInfo.data.data.account_name,
            narration: narration,
        };

        const transfer = await createTransfer(payload);

        res.status(200).json({ error: 'Your request is processing' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
};

const verifyTransactionPin = async (userId, transactionPin) => {
    const user = await getUserById(userId)
    if (!user || !user.transaction_pin) {
        console.log(user)
        throw new Error('Transaction pin not set');
    }
    console.log(user.transaction_pin, transactionPin)
    return (user.transaction_pin === transactionPin);
}



module.exports = { createTransfer, };


//fetch deposit endpoints for a logged in user
//fetch transaction for a logged in user
