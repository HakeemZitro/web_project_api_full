const Card = require("../models/card.js");

const BadRequestError = require("../errors/bad-request-err.js");
const ForbiddenError = require("../errors/forbidden-err.js");
const NotFoundError = require("../errors/not-found-err.js");


// ----- Obtener todos las tarjetas ----- //
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .orFail(() => { throw new NotFoundError("No se encontraron tarjetas") })
    .populate([ "owner", "likes" ])
    .then(cards => res.send(cards))
    .catch(next);
};


// ----- Crear nueva tarjeta ----- //
module.exports.createCard = (req, res, next) => {
  const { name, link } = req.body;

  Card.create({ name, link, owner: req.user._id })
    .then(card => res.send(card))
    .catch(() => {
      next(new BadRequestError("Datos insuficientes o inválidos para crear una tarjeta"));
    });
};


// ----- Eliminar tarjeta por ID ----- //
module.exports.deleteCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findById(cardId)
    .orFail(() => { throw new NotFoundError("La tarjeta que intentas eliminar no existe") })
    .then(card => {
      if (card.owner.toString() !== req.user._id) {
        throw new ForbiddenError("No tienes permiso para eliminar esta tarjeta")
      }
      return card.deleteOne().then(() => res.send(card));
    })
    .catch(next);
};


// ----- Dar like a una tarjeta ----- //
module.exports.likeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then(card => res.send(card))
    .catch(() => {
      next(new NotFoundError("La tarjeta a la que intentas dar like no existe"));
    });
}


// ----- Quitar like a una tarjeta ----- //
module.exports.dislikeCard = (req, res, next) => {
  const { cardId } = req.params;

  Card.findByIdAndUpdate(cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then(card => res.send(card))
    .catch(() => {
      next(new NotFoundError("La tarjeta a la que intentas quitar el like no existe"));
    });
};