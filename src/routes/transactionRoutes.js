const express = require('express');
const TransactionController = require('../controllers/transferController');
const Auth = require('../middlewares/auth');


const router = express.Router();

router.post('/create-transfer', Auth.authorize, TransactionController.createTransfer);




module.exports = router;
