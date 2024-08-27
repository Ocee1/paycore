const express = require('express');


const { setWebhookLink, webhooks } = require('../controllers/webhookController');



const hookRouter = express.Router();

hookRouter.post('/webhook/add-url', setWebhookLink);
hookRouter.post('/webhook', webhooks);


module.exports = { hookRouter };
