const Joi = require("joi");

const timeValidate = Joi.object({
  dated: Joi.string().required().messages({
    "any.required": "Tanggal tidak boleh kosong",
  }),
  hour: Joi.string().required().messages({
    "any.required": "Jam tidak boleh kosong",
  }),
  price: Joi.number().max(99999999999).required().messages({
    "number.max": "Harga tidak boleh lebih dari 11 karakter",
    "any.required": "Harga tidak boleh kosong",
  }),
  id_movie: Joi.number(),
});

module.exports = timeValidate;
