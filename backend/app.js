const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const { login, createUser } = require("./controllers/users.js");
const { auth } = require("./middlewares/auth.js");
const { celebrate, Joi, errors } = require("celebrate");
const NotFoundError = require("./errors/not-found-err.js");

require("dotenv").config();
const { NODE_ENV, PORT } = process.env;

const { requestLogger, errorLogger } = require('./middlewares/logger');


const app = express();
mongoose.connect("mongodb://localhost:27017/aroundb");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(requestLogger);

app.post("/signup", celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), createUser);
app.post("/signin", celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
}), login);

app.use("/", auth, usersRouter);
app.use("/", auth, cardsRouter);

app.use((req, res, next) => {
  const err = new NotFoundError("Recurso solicitado no encontrado");
  next(err);
});

app.use(errorLogger);

app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'Se ha producido un error en el servidor' : message });
});


app.listen(NODE_ENV === "production" ? PORT : 3000);