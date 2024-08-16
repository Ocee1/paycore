const express = require('express');
const UserController = require('../controllers/userController');
const TransactionController = require('../controllers/transactionController');
const Auth = require('../middlewares/auth');


const router = express.Router();

router.post('/create-transfer', Auth.authorize, TransactionController.createTransfer);
router.get('/receive-money-webhook', Auth.authorize, TransactionController.receiveFunds);


module.exports = router;
