const axios = require('axios');
const { atlasConfig, WEBHOOK_URL } = require('../config');


const updateWebhook = async (data) => {
  try {
    const response = await axios(atlasConfig(data, WEBHOOK_URL, 'post', ATLAS_SECRET));

    if (response.data.status !== 'success') {
      throw new Error('Error in updating webhook');
    }

    return response.data;
  } catch (error) {
    console.error('Error in updateWebhook service:', error.message);
    throw error;
  }
};

const createWebhook = async (webHook) => {
  const data = await Webhook.query().insert(webHook);
  return data;
};

const getWebhook = async (session_id) => {
  const hook = await Webhook.query().findOne({ session_id })
  return data;
};

module.exports = {
  updateWebhook, getWebhook, createWebhook
};
