const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => validator.isEmail(v)
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  name: {
    type: { type: String, default: "Jacques Cousteau" },
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: { type: String, default: "Explorador" },
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: { type: String, default: "https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg"},
    validate: {
      validator: (v) => validator.isURL(v)
    },
  },
});

userSchema.statics.findUserByCredentials = function(email, password) {
  return this.findOne({ email })
    .then((user) => {
      if(!user) {
        return Promise.reject(new Error("Email o contraseña incorrecto"));
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if(!matched) {
            return Promise.reject(new Error("Email o contraseña incorrecto"));
          }
        return user;
        });
    });
};

module.exports = mongoose.model("user", userSchema);