const Joi = require("joi");

const voteValidate = Joi.object({
  rating: Joi.number(),
  comment: Joi.string(),
  id_movie: Joi.number().required(),
  id_user: Joi.number().required(),
});

module.exports = voteValidate;
