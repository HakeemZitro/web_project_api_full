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
    minLength: 6,
    select: false,
  },
  name: {
    type: String,
    default: "Jacques Cousteau",
    minLength: 2,
    maxLength: 40,
  },
  about: {
    type: String,
    default: "Explorador",
    minLength: 2,
    maxLength: 200,
  },
  avatar: {
    type: String,
    default: "https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg",
    validate: {
      validator: (v) => validator.isURL(v)
    },
  },
});

userSchema.statics.findUserByCredentials = function(email, password) {
  return this.findOne({ email }).select("+password")
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