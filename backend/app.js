const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const { login, createUser } = require("./controllers/users.js");
const { auth } = require("./middlewares/auth.js");
require("dotenv").config();
const { NODE_ENV, PORT } = process.env;


const app = express();
mongoose.connect("mongodb://localhost:27017/aroundb");


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/signin", login);
app.post("/signup", createUser);

app.use("/", auth, usersRouter);
app.use("/", auth, cardsRouter);

app.use((req, res, next) => {
  res.status(404).send({ message: "Recurso solicitado no encontrado" })
});
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({ message: statusCode === 500 ? 'Se ha producido un error en el servidor' : message });
});


app.listen(NODE_ENV === "production" ? PORT : 3000);