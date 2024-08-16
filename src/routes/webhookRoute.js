const express = require('express');

const Auth = require('../middlewares/auth');
const { setWebhookLink } = require('../controllers/webhookController');



const router = express.Router();

router.post('/receive/webhook', setWebhookLink);




module.exports = router;
