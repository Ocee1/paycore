const { RECHARGE_DATA_URL, atlasConfig, ATLAS_SECRET } = require("../config");
const { getAccountByUserId, updateByAccount } = require("../services/accountService");
const { updateDataById, createDataLog } = require("../services/dataService");
const { verifyTransactionPin, createTransaction, findTransactionByIdAndUpdate } = require("../services/transactionService");
const { generateReference } = require("../utils/token");
const axios = require('axios');
const { validateDataPurchase } = require("../validation/billValidation");
const { sendDebitMail } = require("../mailer");

const purchaseData = async (req, res) => {
    const { user, body } = req;
    const { amount, phone_number, code, provider_code, network, transaction_pin } = body;

    const userAccount = await getAccountByUserId(user.id);
    // verify Trx pin
    const verifyPin = await verifyTransactionPin(user.id, transaction_pin);
    if (!verifyPin) return res.status(400).json({ error: { message: "Incorrect transaction pin" } });

    try {
        const { error } = validateDataPurchase(req.body);
        if (error) {
            console.log(error)
            return res.status(400).json({ error: error.message });
        };

        //check if the amount is negative, if negative stop the process
        if (amount < 0) {
            return res.status(400).json({
                "status": "error",
                "message": "Invalid amount."
            })
        }

        const currentBalance = userAccount.balance;
        if (currentBalance < amount) return res.status(400).json({ error: { message: "Insufficient funds" } });
        const trx_ref = generateReference();

        const newBalance = currentBalance - amount;
        const updateAccountBal = await updateByAccount(userAccount.account_number, newBalance);
        if (!updateAccountBal) {
            console.log({
                "status": "error",
                "message": "Update account balnce failed"
            })
            return " Error in updating user account"
        };

        const transactionData = {
            userId: user.id,
            type: 'data',
            amount: amount,
            status: 1,
            trx_ref,
            balanceBefore: userAccount.balance,
            balanceAfter: newBalance
        };

        const transaction = await createTransaction(transactionData);
        if (!transaction) {
            console.log('error ceating transaction')
            return "Error in creating transaction";
        }

        const dataTable = {
            userId: user.id,
            amount,
            phone_number,
            network,
            merchant_ref: trx_ref,
            status: 1
        };

        const savedTable = await createDataLog(dataTable);
        if (!savedTable) {
            console.log('error logging data')
            return "Error in logging Data purchase";
        };

        const dataVar = {
            code,
            phone_number,
            provider_code,
            merchant_reference: trx_ref
        }

        const response = await axios(atlasConfig(dataVar, RECHARGE_DATA_URL, 'post', ATLAS_SECRET))
            .then(response => {
                return response;
            })
            .catch(error => {

                return { status: 'failed', error };
            });
            
        if (response.status === 'failed') {
            await findTransactionByIdAndUpdate(transaction.id, { status: 2 });
            await updateDataById(savedTable.id, { status: 11 });

            console.log('error completing data transaction on atlas', response.error)
            return res.status(400).json({
                status: 'failed',
                message: "Data purchase transaction failed",
                error: response
            });
        };

        await findTransactionByIdAndUpdate(transaction.id, { status: 3 });
        await updateDataById(savedTable.id, {
            status: 3,
            reference: response.data.reference,
            amount_charged: response.data.amount_charged
        });

        await sendDebitMail(user.email, { account: userAccount.account_number, amount });

        return res.status(200).json({
            status: 'Success',
            message: "Data purchase completed successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

module.exports = purchaseData;