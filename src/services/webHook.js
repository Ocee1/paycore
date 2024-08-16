const axios = require('axios');
const { atlasConfig } = require('../config');


const updateWebhook = async (data) => {
  try {
    const response = await axios(atlasConfig(data, CREATE_ACCOUNT_URL, 'post', ATLAS_SECRET));

    if (response.data.status !== 'success') {
      throw new Error('Error in creating account');
    }

    return response.data;
  } catch (error) {
    console.error('Error in updateWebhook service:', error.message);
    throw error;
  }
};

module.exports = {
  updateWebhook,
};
