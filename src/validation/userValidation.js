const Joi = require('joi');

const signupValidation = (data) => {
    const schema = Joi.object({
        first_name: Joi.string(),
        last_name: Joi.string(),
        email: Joi.string().email().trim().required(),
        phone: Joi.string().required(),
        password: Joi.string().min(6).required()
            .regex(/[a-z]/, 'at least one letter')
            .regex(/[0-9]/, 'at least one number'),
    });

    return schema.validate(data);
}

const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().trim().required(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
}

const transactionPinValidation = (data) => {
    const schema = Joi.object({
      transaction_pin: Joi.string().pattern(/^\d{4}$/)
      .required()
      .messages({
        'string.base': 'Transaction pin should be a string',
        'string.pattern.base': 'Transaction pin must be a 4-digit number',
        'any.required': 'Transaction pin is required'
      })
    })
    return schema.validate(data)
  }

module.exports = {
    signupValidation,
    loginValidation,
    transactionPinValidation
};