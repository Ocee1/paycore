const axios = require('axios');
const { atlasConfig, WEBHOOK_URL } = require('../config/base');
const Webhook = require('../models/webHook');

const createWebhook = async (webHook) => {
  const data = await Webhook.query().insert(webHook);
  return data;
};

const getWebhook = async (session_id) => {
  const data = await Webhook.query()
    .whereRaw('JSON_EXTRACT(meta_data, "$.session_id") = ?', [session_id]);

  return data;
};

module.exports = {
  getWebhook, createWebhook
};
