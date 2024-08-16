const { updateWebhook } = require('../services/webHook'); 

const setWebhookLink = async (req, res) => {
  try {
    const data = req.body; 

    const result = await updateWebhook(data);

    return res.status(200).json({ message: 'Webhook and secret updated successfully', data: result });
  } catch (error) {
    return res.status(400).json({ error: { message: error.message || 'Error in updating webhook' } });
  }
};

module.exports = {
  setWebhookLink,
};