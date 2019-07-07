const mongoose = require('mongoose');
const uuidv4 = require('uuid/v4');

const authSchema = mongoose.Schema({
  uuid: {
    type: String,
    unique: true,
    default: function () {
      return uuidv4();
    }
  },
  user: {
    type: String,
    trim: true
  },
  mobile: {
    type: String,
    trim: true,
    required: true
  },
  token: {
    type: String,
    trim: true
  },
  deactive:{
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
});

const Auth = mongoose.model('Auth', authSchema);
module.exports = Auth;