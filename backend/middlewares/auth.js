const jwt = require("jsonwebtoken");
require("dotenv").config();
const { NODE_ENV, JWT_SECRET } = process.env;

const UnauthorizedError = require("../errors/unauthorized-err.js");
const ForbiddenError = require("../errors/forbidden-err.js");


// ----- Confirma autorizacion mediante token ----- //
module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new ForbiddenError("Sin autorización, inicia sesión"));
  }

  const token = authorization.replace("Bearer ", "");

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === "production" ? JWT_SECRET : "dev-secret");
    req.user = payload;
    next();
  }
  catch (e) {
    next(new UnauthorizedError("Token inválido"));
  }
};