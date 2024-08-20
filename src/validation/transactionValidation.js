const Joi = require('joi');

const validateTransaction = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        transaction_type: Joi.string().required(),
        description: Joi.string().max(500).optional(),
        account_number: Joi.string().required(),
        amount: Joi.number().required(),

    });
    return schema.validate(data);
}

module.exports = validateTransaction;
