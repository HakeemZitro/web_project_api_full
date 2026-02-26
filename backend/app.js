const express = require("express");
const mongoose = require("mongoose");
const usersRouter = require("./routes/users.js");
const cardsRouter = require("./routes/cards.js");

const { PORT = 3000 } = process.env;
const app = express();
mongoose.connect('mongodb://localhost:27017/aroundb');


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '69810761f490c7aca5633abb'
  };
  next();
});
app.use("/", usersRouter);
app.use("/", cardsRouter);
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