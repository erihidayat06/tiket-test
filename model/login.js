const Joi = require("joi");
const { password } = require("../library/database");

const loginValidate = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      "string.email": "Email tidak valid.",
      "any.required": "Email wajib diisi.",
    }),
  password: Joi.string(),
});

module.exports = loginValidate;
