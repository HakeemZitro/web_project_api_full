const usersRouter = require("express").Router();
const { getUsers, getUserById, getUserInfo, updateUserInfo, updateUserAvatar } = require("../controllers/users.js");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error('string.uri');
}

usersRouter.get("/users", celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
}), getUsers);

usersRouter.get("/users/me", celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
}), getUserInfo);

usersRouter.patch("/users/me", celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(40),
    about: Joi.string().required().min(2).max(200),
  }),
}), updateUserInfo);

usersRouter.patch("/users/me/avatar", celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(validateURL),
  }),
}), updateUserAvatar);

usersRouter.get("/users/:id", celebrate({
  headers: Joi.object().keys({
    authorization: Joi.string().required(),
  }).unknown(true),
  params: Joi.object().keys({
    id: Joi.string().hex().length(24).required(),
  }),
}), getUserById);

module.exports = usersRouter;