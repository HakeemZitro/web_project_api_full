const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");
const { login, createUser } = require("./controllers/users.js");
const { auth } = require("./middlewares/auth.js");


const { PORT = 3000 } = process.env;
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
  if(err.name === "SyntaxError") {
    return res.status(400).send({ message: "Solicitud inválida, revisa la sintaxis de tu solicitud" });
  } else {
    res.status(500).send({ message: "Error interno del servidor" });
  }
});


app.listen(PORT, () => {
  console.log(`Aplicacion escuchando el puerto ${PORT}`);
});