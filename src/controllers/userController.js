const axios = require("axios");
const { ATLAS_SECRET, CREATE_ACCOUNT_URL, atlasConfig } = require("../config");
const sendOtp = require("../mailer");
const { createAccount } = require("../services/accountService");
const { createUser, getUserById, findByIdAndUpdate, removeUser, getUserByEmail } = require("../services/user.service");
const { generateOtp, createToken, hashPassword, verifyPassword, verifyOtp } = require("../utils/token");
const { loginValidation, signupValidation } = require("../validation/userValidation");

const registerUser = async (req, res, next) => {
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
            phone: '08123456780',
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
        
        res.status(200).json({ message: 'User created successfully' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error occured while processing your request'})
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
        await sendOtp(otp, isUser.email);


        res.status(200).json({ message: 'OTP sent to your email' })

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

const verifyOtpLogin = async (req, res) => {
    const { email, otp } = req.body;

    const isValidOtp = await verifyOtp(email, otp);
    if (!isValidOtp) {
        res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = getUserByEmail(email);
    const token = await createToken({ email, userId: user.id }, 'ghfgvhbnuvtjb')

    const payload = {
        message: 'Login successful',
        userId: isUser.id,
        accessToken: token,
    }

    res.status(200).json(payload);

};

const createTransactionPin = async (req, res) => {
    const { body, user } = req;
    try {
      const { error } = await this.userValidation.transactionPinValidation(body);
      if (error) return res.status(500).json({ error: { message: 'Invalid OTP' } });;

      const updatedUser = await findByIdAndUpdate(body, user.id)
      if (!updatedUser) return res.status(500).json({ error: { message: 'User Not found' } });
    } catch (error) {
        res.status(500).json({ error: { message: 'Error in generating transaction pin' } });
    }
  }



module.exports = {
    verifyOtpLogin,
    loginUser,
    registerUser,
    createTransactionPin,

}