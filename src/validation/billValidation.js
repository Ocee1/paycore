const Joi = require('joi');

const validateDataPurchase = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        phone_number: Joi.string().required(),
        code: Joi.string().required(),
        provider_code: Joi.string().required(),
        network: Joi.string().required(),
        transactionPin: Joi.string().required(),
    });

    return schema.validate(data);
};

const validateAirtimePurchase = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        newtwork: Joi.string().required(),
        phone_number: Joi.string().required(),
        transactionPin: Joi.string().required(),
    });

    return schema.validate(data);
};

module.exports = {
    validateDataPurchase,
    validateAirtimePurchase
}