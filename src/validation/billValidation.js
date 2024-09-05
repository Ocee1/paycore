const Joi = require('joi');

const validateDataPurchase = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        phone_number: Joi.string().required(),
        code: Joi.string().required(),
        provider_code: Joi.string().required(),
        network: Joi.string().required(),
        transaction_pin: Joi.string().required(),
    });

    return schema.validate(data);
};

const validateAirtimePurchase = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        network: Joi.string().required(),
        phone_number: Joi.string().required(),
        transaction_pin: Joi.string().required(),
    });

    return schema.validate(data);
};

const validateBetData = (data) => {
    const schema = Joi.object({
        type: Joi.string().required(),
        customer_id: Joi.string().required(),
        name: Joi.string().required(),
        amount: Joi.number().required().positive(),
        transaction_pin: Joi.string().required(),
    });

    return schema.validate(data);
};

const validateCableData = (data) => {
    const schema = Joi.object({
        provider: Joi.string().required(),
        smart_card_number: Joi.string().required(),
        phone_number: Joi.string().required(),
        code: Joi.number().required().positive(),
        amount: Joi.number().required().positive(),
        transaction_pin: Joi.string().required(),
    });

    return schema.validate(data);
};

const validateElectricity = (data) => {
    const schema = Joi.object({
        provider: Joi.string().required(),
        meter_number: Joi.string().required(),
        meter_type: Joi.string().required(),
        phone_number: Joi.string().required(),
        amount: Joi.number().required().positive(),
        transaction_pin: Joi.string().required(),
    });

    return schema.validate(data);
};


module.exports = {
    validateDataPurchase,
    validateAirtimePurchase,
    validateBetData,
    validateCableData,
    validateElectricity
}