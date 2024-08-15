const { GET_ACCOUNT_URL, ATLAS_SECRET } = require("../config");
const validate = require("../validation/transactionValidation");


const createTransaction = async (req, res, next) => {
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
    const paymentProviderSignature = req.headers['x-payment-signature']; 
    const payload = req.body;

    
    // Implement your validation logic here
    const isValidRequest = validateRequest(body, paymentProviderSignature);

    if (!isValidRequest) {
        return res.status(400).send('Invalid request');
    }

    // Extract payment data from the request body
    const { amount, currency, userId, transactionId } = body;

    try {
        // if (payload === 'deposit') {
        //     await 
        // }
    
        // Process the payment data (e.g., update user's balance)
        await processPayment(userId, amount, transactionId);

        // Send a success response to acknowledge the webhook
        res.status(200).send('Webhook received and processed');
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).send('Internal Server Error');
    }
};

const processTransfer = async (account) => {
    const userData = getUserByAccount(payload.source.account_number);
    if (!userData) {
        res.status(404).json({ error: { message: 'accpunt not found'} });
    }

}



function validateRequest(body, signature) {
    // Implement your validation logic here
    // Example: Compare the signature with a hash of the request body
    return true; // or false if invalid
}

const verifyTransactionPin = async (userId, transactionPin) => {
    const user = await this.userService.getUserById(userId)
    if (!user || !user.transactionPin) {
      throw new Error('Transaction pin not set');
    }
    return Crypto.compareStrings(user.transactionPin, transactionPin);
  }

module.exports = { createTransaction };