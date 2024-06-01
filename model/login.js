const Joi = require("joi");

const loginValidate = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email tidak valid.",
      "any.required": "Email wajib diisi.",
    }),
});

module.exports = loginValidate;
