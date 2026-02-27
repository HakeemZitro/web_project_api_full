const Card = require("../models/card.js");


// ----- Obtener todos las tarjetas ----- //
module.exports.getCards = (req, res) => {
  Card.find({})
  .orFail(() => {
    const error = new Error("No se encontraron tarjetas");
    error.statusCode = 404;
    throw error;
  })
  .populate([ "owner", "likes" ])
  .then(cards => res.send(cards))
  .catch(err => res.status(err.statusCode).send({ message: err.message }));
};


// ----- Crear nueva tarjeta ----- //
module.exports.createCard = (req, res) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
  .then(card => res.send(card))
  .catch(err => res.status(400).send({ message: "Datos insuficientes o inválidos para crear una tarjeta" }));
};


// ----- Eliminar tarjeta por ID ----- //
module.exports.deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(() => {
      const error = new Error("La tarjeta que intentas eliminar no existe");
      error.statusCode = 404;
      throw error;
    })
    .then(card => {
      if (card.owner.toString() !== req.user._id) {
        return res.status(403).send({ message: "No tienes permiso para eliminar esta tarjeta" });
      }
      return card.deleteOne().then(() => res.send(card));
    })
    .catch(err => res.status(err.statusCode || 500).send({ message: err.message || "Error interno del servidor" }));
};


// ----- Dar like a una tarjeta ----- //
module.exports.likeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then(card => res.send(card))
    .catch(err => res.status(404).send({ message: "La tarjeta a la que intentas dar like no existe" }));
}


// ----- Quitar like a una tarjeta ----- //
module.exports.dislikeCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then(card => res.send(card))
    .catch(err => res.status(404).send({ message: "La tarjeta a la que intentas quitar el like no existe" }));
};