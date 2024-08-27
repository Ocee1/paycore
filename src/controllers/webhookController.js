/* eslint-disable no-unused-vars */
const axios = require('axios');
const { WEBHOOK_SECRET, atlasConfig, WEBHOOK_URL, ATLAS_SECRET } = require('../config/index');
const { sendCreditMail } = require('../mailer');
const Deposit = require('../models/deposit');
const { getAccount, updateByAccount } = require('../services/accountService');
const { getDepositBySessionId, createDeposit } = require('../services/depositService');
const { createTransaction, updateTransactionByRef } = require('../services/transactionService');
const { findTransferByIdAndUpdate, updateTransferByRef, updatePendingTrfByRef, getTrfBySessionId } = require('../services/transferService');
const { getUserByEmail, getUserById } = require('../services/user.service');
const { updateWebhook, getWebhook, createWebhook } = require('../services/webHook');


const setWebhookLink = async (req, res) => {
    const data = req.body;
    try {
        const response = await axios(atlasConfig(data, WEBHOOK_URL, 'post', ATLAS_SECRET));

        if (response.data.status === 'failed') {
            // throw new Error('Error in updating webhook');

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
    } else {
        type = payload.meta.type;
        secret = payload.meta;
    }

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
        const trfHook = await processDeposit(payload);
        return "Successfully processed deposit webhook"
    }
    if (type === 'transfer') {
        await processTransferHook(payload);
        return "Successfully processed transfer webhook";
    };

};


const processDeposit = async (payload) => {
    try {
        const existingDeposit = await getDepositBySessionId(payload.session_id);
        if (existingDeposit) {
            return 'Duplicate transaction';
        }

        const accountData = await getAccount(payload.account_number);
        const userId = accountData.userId;
        console.log(`payloaddedd ====  ;: ${JSON.stringify(payload)}`)

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
        const balanceAfter = newBalance;
        const balanceBefore = accountData.balance;
        const transactionData = {
            type: payload.type,
            userId: userId,
            amount: payload.amount,
            narration: payload.source.narration,
            status: 3,
            balanceBefore,
            balanceAfter
        };


        const updateBalance = await updateByAccount(payload.account_number, newBalance);
        const txn = await createTransaction(transactionData);

        const logDeposit = await createDeposit(depositData)

        if(!logDeposit) {
            return "Failed to log Deposit data"
        }

        await sendCreditMail(user.email, payload);
    } catch (error) {
        console.log('error: ', error)
        return false;
    }
};

//Webhook (the webhook for transfer gives you the final result of the transfer)
const processTransferHook = async (payload) => {
    const { merchant_ref, meta } = payload;
    const { account_name, account_bank, account_number, narration, currency, amount, trx_ref, secret, type } = meta;

    const existingTransfer = await getTrfBySessionId(payload.session_id);
    if (existingTransfer) {
        return 'Duplicate transaction';
    }

    let status;
    if (payload.status) {
        status = payload.status;
    } else {
        status = payload.meta.status;
    }

    if (status === 'failed') {
        await updatePendingTrfByRef(payload, { status: 2, meta_data: meta });
        await updateTransactionByRef(merchant_ref, { status: 2 });
        return "Transaction failed"
    } else {
        await updatePendingTrfByRef(merchant_ref, { status: 3, meta_data: meta });
        await updateTransactionByRef(merchant_ref, { status: 3 });
    };
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