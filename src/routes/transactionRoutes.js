const express = require('express');
const TransactionController = require('../controllers/transferController');
const Auth = require('../middlewares/auth');
const purchaseData = require('../controllers/dataController');


const router = express.Router();

router.post('/create-transfer', Auth.authorize, TransactionController.createTransfer);
router.post('/purchase-data', Auth.authorize, purchaseData);




module.exports = router;
