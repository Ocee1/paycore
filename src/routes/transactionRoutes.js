const express = require('express');
const TransactionController = require('../controllers/transferController');
const Auth = require('../middlewares/auth');
const purchaseData = require('../controllers/dataController');
const betTopUp = require('../controllers/bettingController');
const electricityPayment = require('../controllers/electricityController');
const cableSubs = require('../controllers/cableController');
const purchaseAirtime = require('../controllers/airtimeController');
const { createBulkTransfer } = require('../controllers/bulkTransferController');


const router = express.Router();

router.post('/create-transfer', Auth.authorize, TransactionController.createTransfer);
router.post('/purchase-data', Auth.authorize, purchaseData);
router.post('/purchase-airtime', Auth.authorize, purchaseAirtime);
router.post('/bet-topup', Auth.authorize, betTopUp);
router.post('/electricity-bill', Auth.authorize, electricityPayment);
router.post('/cable', Auth.authorize, cableSubs);
router.post('/bulk-transfer', Auth.authorize, createBulkTransfer);



module.exports = router;
