const { atlasConfig, ATLAS_SECRET, VALIDATE_METER_NUMBER, PURCHASE_ELECTRICITY } = require("../config");
const { getAccountByUserId, updateByAccount } = require("../services/accountService");
const { verifyTransactionPin, createTransaction, findTransactionByIdAndUpdate } = require("../services/transactionService");
const { generateReference } = require("../utils/token");
const axios = require('axios');
const { validateCableData } = require("../validation/billValidation");
const { sendDebitMail } = require("../mailer");
const { createElecLog, updateElecById } = require("../services/electricityService");

const electricityPayment = async (req, res) => {
    const { user, body } = req;
    const { provider, meter_number, meter_type, phone_number, amount, transactionPin } = body;

    const userAccount = await getAccountByUserId(user.id);


    try {
        const { error } = validateCableData(req.body);
        if (error) {
            console.log(error)
            return res.status(400).json({ error: error.message });
        };

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

        const validationResponse = await axios(atlasConfig({
            provider,
            meter_no: meter_number,
            meter_type
        }, VALIDATE_METER_NUMBER, 'post', ATLAS_SECRET))
            .then(response => {
                return response;
            })
            .catch(error => {
                return { status: 'failed', error };
            });

        if (validationResponse.status === 'failed') {
            console.log('Invalid user details')
            return res.status(400).json({
                status: 'failed',
                message: "Invalid user details"
            });
        };

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
            type: 'electricity',
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

        const elecTable = {
            userId: user.id,
            amount,
            provider,
            meter_number,
            meter_type,
            merchant_ref: trx_ref,
            phone_number,
            status: 1
        };

        const savedTable = await createElecLog(elecTable);
        if (!savedTable) {
            console.log('error logging data')
            return "Error in logging Data purchase";
        };

        const dataVar = {
            provider,
            meter_no: meter_number,
            meter_type,
            phone_number,
            amount,
            merchant_reference: trx_ref,
        }

        const response = await axios(atlasConfig(dataVar, PURCHASE_ELECTRICITY, 'post', ATLAS_SECRET))
            .then(response => {
                return response;
            })
            .catch(error => {

                return { status: 'failed', error };
            });
        if (response.status === 'failed') {
            await findTransactionByIdAndUpdate(transaction.id, { status: 2 });
            await updateElecById(savedTable.id, { status: 11 });

            console.log('error completing cable subscription on atlas')
            return res.status(400).json({
                status: 'failed',
                message: "Cable subscription transaction failed"
            });
        };

        // await findTransactionByIdAndUpdate(transaction.id, { status: 3 });
        // await updateElecById(savedTable.id, {
        //     status: 3,
        //     reference: response.data.reference,
        // });

        await sendDebitMail(user.email, { account: userAccount.account_number, amount });

        return res.status(200).json({
            status: 'Success',
            message: "Request is processing"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

module.exports = electricityPayment;