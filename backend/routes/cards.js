const cardsRouter = require('express').Router();
const { getCards, createCard, deleteCard, likeCard, dislikeCard } = require('../controllers/cards.js');
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error('string.uri');
}

cardsRouter.get('/cards', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
}), getCards);

cardsRouter.post('/cards', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().custom(validateURL),
  }),
}), createCard);

cardsRouter.delete('/cards/:cardId', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), deleteCard);

cardsRouter.put('/cards/:cardId/likes', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), likeCard);

cardsRouter.delete('/cards/:cardId/likes', celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object().keys({
    cardId: Joi.string().hex().length(24).required(),
  }),
}), dislikeCard);

module.exports = cardsRouter;