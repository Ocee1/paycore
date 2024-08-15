const { ATLAS_SECRET, CREATE_ACCOUNT_URL } = require("../config");
const sendOtp = require("../mailer");
const { createAccount } = require("../services/accountService");
const { createUser, getUserById, findByIdAndUpdate, removeUser, getUserByEmail } = require("../services/user.service");
const { generateOtp, createToken, hashPassword } = require("../utils/token");
const { loginValidation, signupValidation } = require("../validation/userValidation");

const createUser = async (req, res, next) => {
    const { body } = req;

    try {
        const { error } = signupValidation(body);

        if (error) return res.status(400).json({ error: 'Bad request' });

        const isUser = await getUserByEmail(body.email);
        if (isUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await hashPassword(body.password);
        const data = {
            first_name: body.firstName,
            last_name: body.lastName,
            phone: '08123456780',
            amount: 1000,
            email: body.email,
        };

        const accountRes = await axios(atlasConfig(data, CREATE_ACCOUNT_URL, 'post', ATLAS_SECRET));

        if (accountRes.data.status !== 'success') return res.status(400).json({ error: { message: 'Error in creating account' } });
        
        const { account_number, bank, account_name, } = accountRes.data.data;

        const accountData = {
            userId: isUser.id,
            bank,
            account_number,
            account_name,
            payload_response: accountRes.data.data
        };

        const account = await createAccount(accountData)
        const user = await createUser({
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            password: hashedPassword,
        });

        this.appResponse.created(res, 'User created successfully');



        res.status(200).json({ message: 'User created successfully' })

    } catch (error) {
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
};

const loginUser = async (req, res) => {

    const { body } = req;

    try {
        const { error } = loginValidation(body);

        if (error) res.status(400).json({ error: 'Bad request' })

        const isUser = await getUserByEmail(body.email);
        if (!isUser) return res.status(404).json({ error: 'Invalid login credentials' });

        const validPassword = await Crypto.compareStrings(isUser.password, body.password);

        if (!validPassword) res.status(400).json({ error: 'Invalid login credentials' })

        const otp = await generateOtp(isUser.id);
        await sendOtp(isUser.mail, otp);


        res.status(200).json({ message: 'OTP sent to your email' })

    } catch (error) {
        res.status(500).json({ error: 'Error occured while processing your request' })
    }
}

const verifyOtpLogin = async (req, res) => {
    const { email, otp } = req.body;

    const isValidOtp = await verifyOTP(email, otp);
    if (!isValidOtp) {
        res.status(400).json({ message: 'Invalid or expired OTP' })
    }

    const user = getUserByEmail(email);
    const token = await createToken({ email, userId: user.id })

    const payload = {
        message: 'Login successful',
        userId: isUser.id,
        accessToken: token,
    }

    res.status(200).json(payload);

};




module.exports = {
    verifyOtpLogin,
    loginUser,
    createUser,
}