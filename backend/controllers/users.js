const User = require("../models/user.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { NODE_ENV, JWT_SECRET } = process.env;


// ----- Obtener todos los usuarios ----- //
module.exports.getUsers = (req, res) => {
  User.find({})
  .orFail(() => {
    const error = new Error("No se encontraron usuarios");
    error.statusCode = 404;
    throw error;
  })
  .then((users) => res.send(users))
  .catch((err) => res.status(err.statusCode).send({ message: err.message }));
};


// ----- Obtener informacion de usuario actual ----- //
module.exports.getUserInfo = (req, res) => {
  User.findById(req.user._id)
    .orFail(() => {
      const error = new Error("Sin autorización, inicia sesión");
      error.statusCode = 401;
      throw error;
    })
    .then(user => res.send(user))
    .catch(err => res.status(err.statusCode).send({ message: err.message }));
}


// ----- Obtener un usuario por ID ----- //
module.exports.getUserById = (req, res) => {
  const { id } = req.params;

  User.findById(id)
    .then(user => res.send(user))
    .catch(err => {
      if (err.name === "CastError") {
        return res.status(404).send({ message: "Usuario no encontrado o ID inválido" });
      }
      res.status(err.statusCode || 500).send({ message: err.message || "Error interno del servidor"});
    });
};


// ----- Crear nuevo usuario ----- //
module.exports.createUser = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Email y contraseña son obligatorios" });
  }
  if (password.length < 6) {
    return res.status(400).send({ message: "La contraseña debe tener una longitud mínima de 6 caracteres" });
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ email, password: hash }))
    .then((newUser) => res.status(201).send({ _id: newUser._id, email: newUser.email }))
    .catch((err) => {
      if (err.code === 11000) {
        return res.status(409).send({ message: "El email que intentas usar ya está registrado" });
      }
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: "Datos insuficientes y/o inválidos para crear un usuario" });
      }
      res.status(err.statusCode || 500).send({ message: err.message || "Error interno del servidor" });
    });
};


// ----- Inicio de Sesion ----- //
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({ token: jwt.sign({ _id: user._id }, NODE_ENV === "production" ? JWT_SECRET : "dev-secret", { expiresIn: "7d" }) });
    })
    .catch((err) => {
      res.status(401).send({ message: "Email o contraseña incorrecto" });
    });
}


// ----- Actualizar información de usuario ----- //
module.exports.updateUserInfo = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about }, { new: true, runValidators: true })
    .then(updatedUser => {
        if(!name && !about) {
          return res.status(400).send({ message: "No se proporcionaron datos para actualizar la información del usuario" });
        }
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: "Datos insuficientes o inválidos para actualizar un usuario" });
      }
      res.status(err.statusCode || 500).send({ message: err.message || "Error interno del servidor" });
    });
};


// ----- Actualizar avatar de usuario ----- //
module.exports.updateUserAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true })
    .then(updatedUser => {
        if(!avatar) {
          return res.status(400).send({ message: "No se proporcionaron datos para actualizar el avatar" });
        }
        res.send(updatedUser)
      })
    .catch(err => {
      if (err.name === "ValidationError") {
        return res.status(400).send({ message: "Datos insuficientes o inválidos para actualizar el avatar" });
      }
      res.status(err.statusCode || 500).send({ message: err.message || "Error interno del servidor" });
    });
};