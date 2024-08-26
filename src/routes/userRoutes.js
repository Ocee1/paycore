const express = require('express');
const UserController = require('../controllers/userController');
const Auth = require('../middlewares/auth');



const router = express.Router();

router.post('/auth/signup', UserController.registerUser);
router.post('/auth/signin', UserController.loginUser);
router.post('/auth/verify-otp', UserController.verifyOtpLogin);
router.patch('/create-transaction-pin', Auth.authorize, UserController.createTransactionPin);
router.get('/', UserController.home);




module.exports = router;
