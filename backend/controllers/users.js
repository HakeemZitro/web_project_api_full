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
    .then(user => res.send(user))
    .catch(() => {
      const err = new NotFoundError("Usuario no encontrado o ID inválido");
      next(err);
    });
};


// ----- Crear nuevo usuario ----- //
module.exports.createUser = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    const err = new BadRequestError("Email y contraseña son obligatorios");
    next(err);
  }
  if (password.length < 6) {
    const err = new BadRequestError("La contraseña debe tener una longitud mínima de 6 caracteres");
    next(err);
  }

  bcrypt.hash(password, NODE_ENV === "production" ? BCRYPT_ROUNDS : 10)
    .then((hash) => User.create({ email, password: hash }))
    .then((newUser) => res.status(201).send({ _id: newUser._id, email: newUser.email }))
    .catch((err) => {
      if (err.code === 11000) {
        const err = new ConflictError("El email que intentas usar ya está registrado");
        next(err);
      }
      if (err.name === "ValidationError") {
        const err = new BadRequestError("Datos insuficientes y/o inválidos para crear un usuario");
        next(err);
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
      const err = new UnauthorizedError("Email o contraseña incorrecto");
      return next(err);
    });
}


// ----- Actualizar información de usuario ----- //
module.exports.updateUserInfo = (req, res, next) => {
  const { name, about } = req.body;

  if(!name && !about) {
    const err = new BadRequestError("No se proporcionaron datos para actualizar la información del usuario");
    next(err);
  }

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then(updatedUser => {
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        const err = new BadRequestError("Datos insuficientes o inválidos para actualizar un usuario");
        next(err);
      }
      next(err);
    });
};


// ----- Actualizar avatar de usuario ----- //
module.exports.updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then(updatedUser => {
        if(!avatar) {
          const err = new BadRequestError("No se proporcionaron datos para actualizar el avatar");
          next(err);
        }
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        const err = new BadRequestError("Datos insuficientes o inválidos para actualizar el avatar");
        next(err);
      }
      next(err);
    });
};