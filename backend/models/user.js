const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/(www\.)?[a-zA-Z0-9-]{1,256}\.[a-zA-Z0-9.]{1,8}\b([a-zA-Z0-9._~:/?%#\[\]@!$&'()*+,;=-]*)$/.test(v);
      }
    }
  },
});

module.exports = mongoose.model('user', userSchema);