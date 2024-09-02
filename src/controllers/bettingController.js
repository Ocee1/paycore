const { atlasConfig, ATLAS_SECRET, TOPUP_BET_ACCOUNT_URL, VALIDATE_BET_ACCOUNT_URL } = require("../config");
const { getAccountByUserId, updateByAccount } = require("../services/accountService");

const { verifyTransactionPin, createTransaction, findTransactionByIdAndUpdate } = require("../services/transactionService");
const { generateReference } = require("../utils/token");
const axios = require('axios');
const { validateBetData } = require("../validation/billValidation");
const { sendDebitMail } = require("../mailer");
const { updateBetById, createBetLog } = require("../services/bettingService");

const betTopUp = async (req, res) => {
    const { user, body } = req;
    const { type, customer_id, name, amount, transactionPin } = body;

    const userAccount = await getAccountByUserId(user.id);


    try {
        const { error } = validateBetData(req.body);
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
            type,
            customer_id
        }, VALIDATE_BET_ACCOUNT_URL, 'post', ATLAS_SECRET))
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
            type: 'bet',
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

        const betTable = {
            userId: user.id,
            amount,
            type,
            customer_id,
            name,
            merchant_ref: trx_ref,
            status: 1
        };

        const savedTable = await createBetLog(betTable);
        if (!savedTable) {
            console.log('error logging data')
            return "Error in logging Data purchase";
        };

        const dataVar = {
            type,
            customer_id,
            name,
            amount,
            merchant_reference: trx_ref
        }

        const response = await axios(atlasConfig(dataVar, TOPUP_BET_ACCOUNT_URL, 'post', ATLAS_SECRET))
            .then(response => {
                return response;
            })
            .catch(error => {

                return { status: 'failed', error };
            });
        if (response.status === 'failed') {
            await findTransactionByIdAndUpdate(transaction.id, { status: 2 });
            await updateBetById(savedTable.id, { status: 11 });

            console.log('error completing bet transaction on atlas', response.error)
            return res.status(400).json({
                status: 'failed',
                message: "Bet account top-up transaction failed"
            });
        };

        await findTransactionByIdAndUpdate(transaction.id, { status: 3 });
        await updateBetById(savedTable.id, {
            status: 3,
            reference: response.data.reference,
        });

        await sendDebitMail(user.email, { account: userAccount.account_number, amount });

        return res.status(200).json({
            status: 'Success',
            message: "Bet account top-up completed successfully"
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

module.exports = betTopUp;