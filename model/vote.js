const Joi = require("joi");

const voteValidate = Joi.object({
  rating: Joi.number(),
  comment: Joi.string(),
  id_movie: Joi.number(),
  id_user: Joi.number(),
});

module.exports = voteValidate;
