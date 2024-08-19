const { GET_ACCOUNT_URL, ATLAS_SECRET, atlasConfig } = require("../config");
const validate = require("../validation/transactionValidation");
const { getUserById, } = require("../services/user.service");
const Transaction = require("../models/transaction");
const { createTransaction, } = require("../services/transactionService");
const axios = require("axios");



const createTransfer = async (req, res) => {
    const { body, user } = req;
    const { amount, transactionType, transactionPin, account_number, bank_code, narration, reference } = body;

    try {
        const { error } = validate.validateTransaction(body);
        if (error) return res.status(400).json({ error: 'Bad request' });

        const verifyPin = await verifyTransactionPin(user.id, transactionPin);
        if (!verifyPin) return res.status(400).json({ error: { message: "Incorrect transaction pin" } });

        const sender = await getUserById(user.id);

        if (sender.balance < amount) return res.status(400).json({ error: { message: "Insufficient funds" } });

        const accountInfo = await axios(atlasConfig({ bank: receiver.bank, account_number: receiver.account_number }, GET_ACCOUNT_URL, 'post', ATLAS_SECRET));
        if (accountInfo.data.status !== 'success') return res.status(400).json({ error: { message: "Account not found" } });

        const data = {
            userId: user.id,
            transactionType,
            amount,
            description: narration,
            status: '0',
            balanceBefore: balance,
        };

        const transaction = await createTransaction(data);
        const payload = {
            transactionId: transaction.id.toString(),
            amount,
            bank: accountInfo.data.data.bank,
            bank_code,
            account_number,
            account_name: accountInfo.data.data.account_name,
            narration,
            reference,
            transactionType
        };

        const transfer = await Transfer.query().insert(payload);

        res.status(200).json({ error: 'Your request is processing' });
    } catch (error) {
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
};





const verifyTransactionPin = async (userId, transactionPin) => {
    const user = await getUserById(userId)
    if (!user || !user.transactionPin) {
        throw new Error('Transaction pin not set');
    }
    return Crypto.compareStrings(user.transactionPin, transactionPin);
}


module.exports = { createTransfer, };