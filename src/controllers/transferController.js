/* eslint-disable no-unused-vars */
const { GET_ACCOUNT_URL, ATLAS_SECRET, atlasConfig, getTransactionFee } = require("../config/index");
const validate = require("../validation/transactionValidation");
const { getUserById, } = require("../services/user.service");
const axios = require("axios");
const { getAccountByUserId } = require("../services/accountService");
const { generateReference } = require("../utils/token");
const { createTrf } = require("../services/transferService");


const createTransfer = async (req, res, next) => {
    const { amount, transactionPin, account_number, bank, bank_code, narration, currency } = req.body;
    const user = req.user;

    try {
        //data => amount, bank_code, bank_name, account_number, account_name, narrations, currency
        //validate the data above
        const { error } = validate(req.body);
        if (error) {
            console.log(error)
            return res.status(400).json({ error: error.message });
        }

        const senderAccount = await getAccountByUserId(user.id);
        // verify Trx pin
        const verifyPin = await verifyTransactionPin(user.id, transactionPin);
        if (!verifyPin) return res.status(400).json({ error: { message: "Incorrect transaction pin" } });

        //check if the amount is negative, if negative stop the process
        if (amount < 0) {
            return res.status(400).json({
                "status": "error",
                "message": "Invalid amount."
            })
        }

        //validate the account number
        const accountInfo = await axios(atlasConfig({ bank: bank_code, account_number: account_number }, GET_ACCOUNT_URL, 'post', ATLAS_SECRET));
        if (accountInfo.data.status !== 'success') {
            console.log('------info ----- :', accountInfo.data)
            return res.status(400).json(
            {
                "status": "error",
                "message": "Account not found"
            });
        }
        //select the account details and the get the current user balance
        const currentBalance = senderAccount.balance;

        //check to make sure the user balance can carry the transfer
        if (currentBalance < amount) return res.status(400).json({ error: { message: "Insufficient funds" } });

        //generate a trx_ref (transaction reference)
        const trx_ref = generateReference();
        const fee = getTransactionFee(amount);

        //save the transfer on the transfer table, with status 0

        const payload = {
            trx_ref: ~~trx_ref,
            userId: user.id,
            status: 0,
            amount: amount,
            fee: fee,
            bank: bank,
            bank_code: bank_code,
            account_number: account_number,
            account_name: accountInfo.data.data,
            narration: narration,
        };

        const transfer = await createTrf(payload);
        if (!transfer) {
            console.log('Failed to create transfer!!!')
            return res.status(400).json({ error: "Failed to save transfer" });
        }

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

    return (user.transaction_pin === transactionPin);
}



module.exports = { createTransfer };


//fetch deposit endpoints for a logged in user
//fetch transaction for a logged in user
