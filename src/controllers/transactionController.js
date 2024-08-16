const { GET_ACCOUNT_URL, ATLAS_SECRET, DATABASE_HOST, DATABASE_PASSWORD, WEGHOOK_SECRET, atlasConfig } = require("../config");
const validate = require("../validation/transactionValidation");
const { getUserById, getUserByAccount, } = require("../services/user.service");
const Transaction = require("../models/transaction");
const { createTransaction, getWebhook } = require("../services/transactionService");
const { getAccount } = require("../services/accountService");
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
            senderId: user.id,
            transactionType,
            amount,
            description: narration,
            status: 'pending',
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

        response.created(res, 'Transaction created successfully');
    } catch (error) {
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
};

const receiveFunds = async (req, res) => {
    const payload = req.body;

    const isValidRequest = validateSignature(payload.secret);
    if (!isValidRequest) {
        return res.status(400).send('Invalid request');
    }

    const isExisting = await getWebhook(payload.session_id)
    if (isExisting) {
        return res.status(200).send('Processing transaction');
    }

    const { type, source, secret, session_id, account_number, amount } = req.body;

    const transactionData = {
        senderId: user.id,
        transactionType: type,
        amount,
        narration,
        status: 0,
        balanceBefore: balance,
    }

    const transferData = {
        amount,
        bank: accountInfo.data.data.bank,
        bank_code,
        account_number,
        account_name: accountInfo.data.data.account_name,
        narration,
        status: 0,
        reference,
        transactionType
    }
    try {
        if (payload.type === 'collection') {
            const transfer = await processTransfer(account_number, transactionData, transferData)
        }

        // Send a success response to acknowledge the webhook
        res.status(200).send('Webhook received and processed');
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Internal Server Error');
    }
};

const processTransfer = async (account, txnData, trfData) => {
    const accountData = getAccount(account);
    const transactionData = {
        ...txnData,
        balanceBefore: userData.balance,
    };

    if (!accountData) {
        res.status(404).json({ error: { message: 'account not found' } });
    }

    const transaction = await createTransaction(transactionData);

    const transferData = {
        transactionId: transaction.id.toString(),
        ...trfData
    };
    const transfer = await Transfer.query().insert(transferData);
    return { transaction, transfer };
}

const verifyTransactionPin = async (userId, transactionPin) => {
    const user = await getUserById(userId)
    if (!user || !user.transactionPin) {
        throw new Error('Transaction pin not set');
    }
    return Crypto.compareStrings(user.transactionPin, transactionPin);
}

const validateSignature = async (secret) => {
    if (WEGHOOK_SECRET !== secret) {
        return false;
    }
    return true;
}
module.exports = { createTransfer, receiveFunds, };