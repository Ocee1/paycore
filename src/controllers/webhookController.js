/* eslint-disable no-unused-vars */
const axios = require('axios');
const { WEBHOOK_SECRET, atlasConfig, WEBHOOK_URL, ATLAS_SECRET } = require('../config/index');
const { sendCreditMail } = require('../mailer');
const Deposit = require('../models/deposit');
const { getAccount, updateByAccount } = require('../services/accountService');
const { getDepositBySessionId, createDeposit } = require('../services/depositService');
const { createTransaction, updateTransactionByRef } = require('../services/transactionService');
const { findTransferByIdAndUpdate, updateTransferByRef, updatePendingTrfByRef, getTrfBySessionId, checkForBulkAndUpdateStatus, getTransferByTrxRef } = require('../services/transferService');
const { getUserByEmail, getUserById } = require('../services/user.service');
const { updateWebhook, getWebhook, createWebhook } = require('../services/webHook');
const { getElecByTrxRef, getPendingElecBill, updateElecById } = require('../services/electricityService');


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
    let type = payload.type;;
    let secret = payload.secret;;

    const webPayload = {
        type: payload.type,
        meta_data: payload
    };

    const hook = await createWebhook(webPayload);


    const isValidRequest = validateSignature(secret);
    if (!isValidRequest) {
        return res.status(400).send('Invalid request');
    }

    res.status(200).json({
        status: true,
        message: 'Webhook received',
    });

    if (type === 'collection') {
        const trfHook = await processDeposit(payload);
        return "Successfully processed deposit webhook"
    };

    if (type === 'transfer') {
        await processTransferHook(payload);
        return "Successfully processed transfer webhook";
    };

    if (type === 'electricity') {
        // await processTransferHook(payload);
        // return "Successfully processed transfer webhook";
    };

};


const processDeposit = async (payload) => {
    try {
        const existingDeposit = await getDepositBySessionId(payload.session_id);
        if (existingDeposit) {
            return 'Duplicate transaction';
        }

        const accountData = await getAccount(payload.account_number);
        if (!accountData) {
            console.log({
                status: 'fail',
                messsage: 'Deposit made on merchant collection account.'
            })
            return {
                status: 'fail',
                messsage: 'Deposit made on merchant collection account.'
            }
        }
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
        const balanceAfter = newBalance;
        const balanceBefore = accountData.balance;
        const transactionData = {
            type: payload.type,
            userId: userId,
            amount: payload.amount,
            status: 3,
            balanceBefore,
            balanceAfter
        };


        const updateBalance = await updateByAccount(payload.account_number, newBalance);
        const txn = await createTransaction(transactionData);

        const logDeposit = await createDeposit(depositData)

        if (!logDeposit) {
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
    const { merchant_ref, meta, trx_ref } = payload;
    const { account_name, account_bank, account_number, narration, currency, amount, secret, type } = meta;

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

    if (status === 'fail') {
        await updatePendingTrfByRef(payload, { status: 11, meta_data: meta });
        await updateTransactionByRef(merchant_ref, { status: 2 });
        console.log({ status: "Failed", Message: "Transfer failed" })
        return "Transaction failed"
    }
    await updatePendingTrfByRef(merchant_ref, {
        status: 3,
        meta_data: meta,
        payment_gateway_ref: trx_ref
    });

    const trfUpdate = await getTransferByTrxRef(merchant_ref)


    if (trfUpdate.bulk_transfer_id) {
        const bulk_id = trfUpdate.bulk_transfer_id;
        const tryBulk = checkForBulkAndUpdateStatus(bulk_id);
        if (!tryBulk) {
            console.log('bulk not completed!!!!!')
        }
    } else {
        const ment = await updateTransactionByRef(merchant_ref, {
            status: 3,
            payment_gateway_ref: trx_ref
        });
    }
    await updateTransactionByRef(merchant_ref, {
        status: 3,
        payment_gateway_ref: trx_ref
    });

    console.log({ status: "Successful", Message: "Transfer succesful", trx_ref })
    return "Transfer successful"

};

const processElectricity = async (payload) => {
    const { merchant_ref, meta, status } = payload;
    const { reference, customer_name, customer_address } = meta;

    const pendingBill = await getPendingElecBill(merchant_ref);
    if (!pendingBill) {
        console.log('Transaction not found')
        return "Electricity bill not found";
    }

    if (status === 'failed') {
        await updateElecById({ status: 11, reference, }, pendingBill.id);
        await updateTransactionByRef(merchant_ref, {
            status: 2,
            payment_gateway_ref: reference,
            customer_name,
            customer_address,
            reference,
            meta_data: meta
        });
        console.log({ status: "Failed", Message: "Electricity payment failed" })
        return "Electricity payment failed"
    } else {
        await updateElecById({
            status: 3,
            customer_name,
            customer_address,
            reference,
            meta_data: meta
        }, pendingBill.id);
        await updateTransactionByRef(merchant_ref, {
            status: 3,
            payment_gateway_ref: reference
        });
        console.log({ status: "Successful", Message: "Transfer succesful", reference })
        return "Transfer successful"
    };
}

const validateSignature = async (secret) => {
    if (WEBHOOK_SECRET !== secret) {
        return false;
    }
    return true;
};

module.exports = {
    setWebhookLink,
    webhooks
};

