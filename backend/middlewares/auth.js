const jwt = require("jsonwebtoken");
require("dotenv").config();
const { NODE_ENV, JWT_SECRET } = process.env;


module.exports.auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(403).send({ message: "Sin autorización, inicia sesión" });
  }

  const token = authorization.replace("Bearer ", "");

  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === "production" ? JWT_SECRET : "dev-secret");
    req.user = payload;
    next();
  }
  catch (err) {
    return res.status(401).send({ message: "Token inválido" });
  }
};