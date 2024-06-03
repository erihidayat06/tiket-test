const Joi = require("joi");

const actorValidate = Joi.object({
  name_actor: Joi.string().max(100).required().messages({
    "string.max": "Nama actor tidak boleh lebih dari 100 karakter",
    "any.required": "Silahkan Tulis Nama Actor",
  }),
  cast: Joi.string().max(100).required().messages({
    "string.max": "Nama peran tidak boleh lebih dari 100 karakter",
    "any.required": "Silahkan Tulis Nama Peran",
  }),
  id_movie: Joi.number(),
  picture_lama: Joi.string(),
});

module.exports = actorValidate;
