const express = require('express');

const Auth = require('../middlewares/auth');
const { setWebhookLink, webhooks } = require('../controllers/webhookController');



const router = express.Router();

router.post('/receive/webhook', setWebhookLink);
router.post('/webhook', Auth.authorize, webhooks);




module.exports = router;
