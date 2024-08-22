const express = require('express');

const Auth = require('../middlewares/auth');
const { setWebhookLink, webhooks } = require('../controllers/webhookController');



const hookRouter = express.Router();

hookRouter.post('/receive/webhook', setWebhookLink);
hookRouter.post('/webhook', webhooks);


module.exports = { hookRouter };
