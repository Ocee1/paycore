const axios = require('axios');
const { WEBHOOK_SECRET, atlasConfig, WEBHOOK_URL, ATLAS_SECRET } = require('../config');
const { sendCreditMail } = require('../mailer');
const Deposit = require('../models/deposit');
const { getAccount, updateByAccount } = require('../services/accountService');
const { getDepositBySessionId } = require('../services/depositService');
const { createTransaction, updateTransactionByRef } = require('../services/transactionService');
const { findTransferByIdAndUpdate, updateTransferByRef, updatePendingTrfByRef } = require('../services/transferService');
const { getUserByEmail, getUserById } = require('../services/user.service');
const { updateWebhook, getWebhook, createWebhook } = require('../services/webHook');


const setWebhookLink = async (req, res) => {
    const data = req.body;
    try {
        const response = await axios(atlasConfig(data, WEBHOOK_URL, 'post', ATLAS_SECRET));

        if (response.data.status === 'failed') {
            // throw new Error('Error in updating webhook');
            console.log('-----==: ', response.data)
            return res.status(400).json({ error: 'Failed to update webhook' })
        }

        return res.status(200).json({ message: 'Webhook and secret updated successfully', data: response.data });
    } catch (error) {
        console.error('Error in updating Webhook URL:', error.message);
        return res.status(400).json({ error: { message: error.message || 'Error in updating webhook' } });
    }
};

const webhooks = async (req, res) => {
    const payload = req.body;
    let type;
    let secret;

    if (payload.type && payload.secret) {
        type = payload.type;
        secret = payload.secret;
    }
    type = payload.meta.type;
    secret = payload.meta;
    const webPayload = {
        type: payload.type,
        meta_data: payload
    }
    const hook = await createWebhook(webPayload);
    secret = payload.secret || payload.meta.secret;

    const isValidRequest = validateSignature(payload.secret);
    if (!isValidRequest) {
        return res.status(400).send('Invalid request');
    }

    res.status(200).json({
        status: true,
        message: 'Webhook received',
    });

    if (payload.type === 'collection') {
        const trfHook = await processTransferHook(payload)
    }
    if (type === 'transfer') {
        await processReversal(payload);
    }

};


const processDeposit = async (payload) => {
    try {
        const existingDeposit = await getDepositBySessionId(payload.session_id);
        if (existingDeposit) {
            return 'Duplicate transaction';
        }

        const accountData = await getAccount(payload.account_number);
        const userId = accountData.userId;

        const user = await getUserById(userId);
        const depositData = {
            type: payload.type,
            amount: payload.amount,
            session_id: payload.session_id,
            userId,
            status: 3,
            account_number: payload.account_number,
            source: payload.source
        };

        const newBalance = ~~accountData.balance + ~~payload.amount;
        const balanceAfter = String(newBalance);
        const balanceBefore = String(accountData.balance);
        const transactionData = {
            transactionType: payload.type,
            userId: String(userId),
            amount: payload.amount,
            narration: payload.source.narration,
            status: 3,
            balanceBefore,
            balanceAfter
        };
        console.log('loooooooo:  ', transactionData)

        const updateBalance = await updateByAccount(payload.account_number, newBalance);
        const txn = await createTransaction(transactionData);

        const logDeposit = await Deposit.query().insert(depositData);

        await sendCreditMail(user.email, payload);
    } catch (error) {
        console.log('error: ', error)
        return false;
    }
};

//Webhook (the webhook for transfer gives you the final result of the transfer)
const processTransferHook = async (payload) => {
    let status;
    if (payload.status) {
        status = payload.status;
    }
    status = payload.meta.status;
    if (status === 'failed') {
        const { merchant_ref, meta } = payload;
        const { account_name, account_bank, account_number, narration, currency, amount, trx_ref, secret, status, type } = meta;
        await updatePendingTrfByRef(merchant_ref, { status: 11 });
        await updateTransactionByRef(merchant_ref, { status: 11 });
    }

    await updatePendingTrfByRef(merchant_ref, { status: 3 });
    await updateTransactionByRef(merchant_ref, { status: 3 });

};

const validateSignature = async (secret) => {
    if (WEBHOOK_SECRET !== secret) {
        return false;
    }
    return true;
};

module.exports = {
    setWebhookLink,
    webhooks,
};