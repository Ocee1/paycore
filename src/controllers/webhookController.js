const { sendCreditMail } = require('../mailer');
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

    const isExisting = await getWebhook(payload.session_id)
    if (isExisting) {
        return res.status(200).send('Processing transaction');
    }

    const webPayload = {
        type,
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
            return res.status(400).json({error: { message: 'Duplicate transaction'}});
        }

        const accountData = getAccount(payload.account);
        const userId = accountData.userId;
        const user = await getUserById(userId);
        const depositData = {
            type,
            amount,
            session_id,
            userId,
            status: 0,
            account_number,
            source
        };

        const transactionData = {
            transactionType: type,
            userId,
            amount,
            narration,
            status: 0,
            balanceBefore: accountData.balance,
        };

        if (!accountData) {
            res.status(404).json({ error: { message: 'account not found' } });
        }

        const newBalance = accountData.balance + payload.amount;
        const txn = await createTransaction(transactionData);
        const updateBalance = await updateByAccount(payload.account, newBalance);
        const logDeposit = await Deposit.query().insert(depositData);

        await sendCreditMail(user.email, payload);
    } catch (error) {
        console.log('error: ', error)
        return false;
    }
};

const validateSignature = async (secret) => {
    if (WEGHOOK_SECRET !== secret) {
        return false;
    }
    return true;
};

module.exports = {
    setWebhookLink,
    webhooks,
};