const axios = require("axios");
const { ATLAS_SECRET, CREATE_ACCOUNT_URL, atlasConfig, } = require("../config/index");
const { sendOtp } = require("../mailer");
const { createAccount, getAccountByUserId } = require("../services/accountService");
const { createUser, getUserById, findByIdAndUpdate, getUserByEmail, } = require("../services/user.service");
const { generateOtp, createToken, hashPassword, verifyPassword, verifyOtp, saveOtp } = require("../utils/token");
const { loginValidation, signupValidation, transactionPinValidation } = require("../validation/userValidation");


const registerUser = async (req, res) => {
    console.log('Request Body:', req.body);
    const { body } = req;

    try {
        const { error } = signupValidation(body);

        if (error) return res.status(400).json({ error: 'Bad request' });

        const isUser = await getUserByEmail(body.email);
        if (isUser) return res.status(400).json({ message: 'User already exists' });

        const { hash } = await hashPassword(body.password);
        const data = {
            first_name: body.firstName,
            last_name: body.lastName,
            phone: '08148009889',
            amount: 0,
            email: body.email,
        };

        const accountRes = await axios(atlasConfig(data, CREATE_ACCOUNT_URL, 'post', ATLAS_SECRET));

        if (accountRes.data.status !== 'success') return res.status(400).json({ error: { message: 'Error in creating account' } });

        const { account_number, bank, customer } = accountRes.data.data;

        const user = await createUser({
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            password: hash,
        });

        const accountData = {
            userId: user.id,
            bank,
            balance: 0,
            account_number,
            account_name: customer.first_name + customer.last_name,
            payload_response: accountRes.data.data
        };

        const account = await createAccount(accountData)
        if (!account) {
            return res.status(500).json({ error: 'Error occured while creating account' });
        }

        res.status(200).json({ message: 'User created successfully' })

    } catch (error) {
        res.status(500).json({ error: 'Error occured while processing your request', message: error.message })
    }
};

const loginUser = async (req, res) => {

    const { body } = req;

    try {
        const { error } = loginValidation(body);

        if (error) return res.status(400).json({ error: 'Bad request' })

        const isUser = await getUserByEmail(body.email);
        if (!isUser) {
            return res.status(404).json({ error: 'Invalid login credentials' });
        }

        const validPassword = await verifyPassword(body.password, isUser.password);

        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid login credentials' });
        }

        const otp = await generateOtp(isUser.id);
        const toksOtp = await saveOtp(isUser.id, otp);
        if (!toksOtp) {
            return res.status(400).json({ error: "Error saving OTP to DB" })
        }

        await sendOtp(otp, isUser.email);
        console.log(otp);


        res.status(200).json({ message: 'OTP sent to your email' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

const verifyOtpLogin = async (req, res) => {
    const { email, otp } = req.body;

    const user = await getUserByEmail(email);

    const isValidOtp = await verifyOtp(user.id, otp);
    if (isValidOtp === false) {
        return res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const token = await createToken({ email, userId: user.id })
    if (!token) {
        return res.status(500).send('error saving token');
    }
    const theAcc = await getAccountByUserId(user.id)
    const payload = {
        message: 'Login successful',
        userId: user.id,
        accessToken: token,
        theAcc
    }

    res.status(200).json(payload);

};

const createTransactionPin = async (req, res) => {
    const { body, user } = req;
    try {
        const transaction_pin = body.transaction_pin;
        const { error } = await transactionPinValidation(body);
        if (error) {
            console.log('error  :', error)
            return res.status(500).json({ error: { message: 'Enter a valid pin' } });;
        }
        const isUser = await getUserById(user.id);
        if (isUser.transaction_pin) {
            const acc = await getAccountByUserId(isUser.id);
            console.log(JSON.stringify(acc))
            return res.status(400).json({ error: { message: "Transaction pin already exists!" } });
        }
        const updatedUser = await findByIdAndUpdate({ transaction_pin }, user.id)
        if (!updatedUser) return res.status(500).json({ error: { message: 'User Not found' } });

        res.status(201).json({ message: 'Transaction Pin successfully created!', updatedUser })
    } catch (error) {
        console.log('error:  :', error)
        res.status(500).json({ error: { message: 'Error in generating transaction pin' } });
    }
}

const home = (req, res) => {
    return res.send('Welcome to Paycore. The home os seamless TXNs')
}

const getBalance = async (req, res) => {
    const { user } = req;
    const userAccount = await getAccountByUserId(user.id);
    // var config = {
    //     url: GET_COLLECTIONS_URL,
    //     method: 'GET',
    //     headers: {
    //         'Content-Type': 'application/x-www-form-urlencoded',
    //         'Authorization': `Bearer ${ATLAS_SECRET}`
    //     },
    // };
    // const collections = await axios(config);
    // const data = !collections.status ? res.status(404).json({ error: "ops failed" }) : collections;
    res.status(200).json({ status: 'success', message: `Your account balance for account ${userAccount.account_number} is ====:: ${userAccount.balance} and \n coleections===== :::` })
}

module.exports = {
    verifyOtpLogin,
    loginUser,
    registerUser,
    createTransactionPin,
    home,
    getBalance
}