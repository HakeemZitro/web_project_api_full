const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const { login, createUser } = require("./controllers/users.js");
const { auth } = require("./middlewares/auth.js");
const { celebrate, Joi, errors } = require("celebrate");
const NotFoundError = require("./errors/not-found-err.js");
const { requestLogger, errorLogger } = require('./middlewares/logger');
require("dotenv").config();
const { PORT } = process.env;

const cors = require("cors");
const allowedOrigins = ["https://around.hzitro.dev", "https://www.around.hzitro.dev", "https://api.around.hzitro.dev", "http://localhost:3210"];
var corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg =
        "The CORS policy for this site does not " +
        "allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'authorization'],
}


const app = express();
mongoose.connect("mongodb://localhost:27017/aroundb");

app.use(cors({
  origin: corsOptions,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(requestLogger);


app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('El servidor va a caer');
  }, 0);
});

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


app.listen(PORT);