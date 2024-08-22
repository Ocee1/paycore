const Joi = require('joi');

const validateTransaction = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        transactionPin: Joi.string().required(),
        type: Joi.string().required(),
        account_number: Joi.string().required(),
        bank: Joi.string().required(),
        bank_code: Joi.string().required(),
        narration: Joi.string().max(500).optional(),
        currency: Joi.string().required()
    });

    return schema.validate(data);
};

module.exports = validateTransaction;
