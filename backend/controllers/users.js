const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { NODE_ENV, JWT_SECRET, JWT_ACCESS_EXPIRES_IN, BCRYPT_ROUNDS } = process.env;

const BadRequestError = require("../errors/bad-request-err.js");
const UnauthorizedError = require("../errors/unauthorized-err.js");
const NotFoundError = require("../errors/not-found-err.js");
const ConflictError = require("../errors/conflict-err.js");


// ----- Obtener todos los usuarios ----- //
module.exports.getUsers = (req, res, next) => {
  User.find({})
  .orFail(() => { throw new NotFoundError("No se encontraron usuarios") })
  .then((users) => res.send(users))
  .catch(next);
};


// ----- Obtener informacion de usuario actual ----- //
module.exports.getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
  .orFail(() => { throw new UnauthorizedError("Sin autorización, inicia sesión") })
  .then(user => res.send(user))
  .catch(next);
}


// ----- Obtener un usuario por ID ----- //
module.exports.getUserById = (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
    .orFail(() => { throw new NotFoundError("No se encontro al usuario") })
    .then(user => res.send(user))
    .catch(next);
};


// ----- Crear nuevo usuario ----- //
module.exports.createUser = (req, res, next) => {
  const { email, password } = req.body;

  bcrypt.hash(password, NODE_ENV === "production" ? BCRYPT_ROUNDS : 10)
    .then((hash) => User.create({ email, password: hash }))
    .then((newUser) => res.status(201).send({ _id: newUser._id, email: newUser.email }))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError("El email que intentas usar ya está registrado"));
      }
      if (err.name === "ValidationError") {
        next(new BadRequestError("Datos insuficientes y/o inválidos para crear un usuario"));
      }
      next(err);
    });
};


// ----- Inicio de Sesion ----- //
module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({ token: jwt.sign({ _id: user._id }, NODE_ENV === "production" ? JWT_SECRET : "dev-secret", { expiresIn: NODE_ENV === "production" ? JWT_ACCESS_EXPIRES_IN : "1d" }) });
    })
    .catch(() => {
      next(new UnauthorizedError("Email o contraseña incorrecto"));
    });
}


// ----- Actualizar información de usuario ----- //
module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then(updatedUser => {
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Datos insuficientes o inválidos para actualizar un usuario"));
      }
      next(err);
    });
};


// ----- Actualizar avatar de usuario ----- //
module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then(updatedUser => {
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Datos insuficientes o inválidos para actualizar el avatar"));
      }
      next(err);
    });
};