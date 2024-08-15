const validateTransaction = (data) => {
    const schema = Joi.object({
        amount: Joi.number().required().positive(),
        transaction_type: Joi.string().valid('credit', 'debit').required(),
        description: Joi.string().max(500).optional(),
        senderId: Joi.string().required(),
        receiverId: Joi.string().required(),

    });
    return schema.validate(data);
}

module.exports = validateTransaction;
