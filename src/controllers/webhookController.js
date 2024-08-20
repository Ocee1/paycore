const { WEBHOOK_SECRET } = require('../config');
const { sendCreditMail } = require('../mailer');
const Deposit = require('../models/deposit');
const { getAccount, updateByAccount } = require('../services/accountService');
const { getDepositBySessionId } = require('../services/depositService');
const { createTransaction } = require('../services/transactionService');
const { getUserByEmail, getUserById } = require('../services/user.service');
const { updateWebhook, getWebhook, createWebhook } = require('../services/webHook');


const setWebhookLink = async (req, res) => {
    try {
        const data = req.body;

        const result = await updateWebhook(data);

        return res.status(200).json({ message: 'Webhook and secret updated successfully', data: result });
    } catch (error) {
        return res.status(400).json({ error: { message: error.message || 'Error in updating webhook' } });
    }
};

const webhooks = async (req, res) => {
    const payload = req.body;

    const webPayload = {
        type: payload.type,
        meta_data: payload
    }
    const hook = await createWebhook(webPayload);

    const isValidRequest = validateSignature(payload.secret);
    if (!isValidRequest) {
        return res.status(400).send('Invalid request');
    }

    res.status(200).json({
        status: true,
        message: 'Webhook received',
    });

    if (payload.type === 'collection') {
        const deposit = await processDeposit(payload)
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