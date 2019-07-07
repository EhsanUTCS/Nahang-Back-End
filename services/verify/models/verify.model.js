const mongoose = require('mongoose');
const randomString = require('randomstring');
const uuidv4 = require('uuid/v4');

const verifySchema = mongoose.Schema({
  hash: {
    type: String,
    unique: true,
    default: function () {
      return uuidv4();
    }
  },
  for: {
    type: String,
    trim: true,
    required: "Please fill in a for"
  },
  code: {
    type: String,
    trim: true,
    default: function () {
      return randomString.generate({
        length: 4,
        charset: "0123456789"
      });
    }
  },
  used: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
  },
  createdBy: {
    type: String,
    trim: true,
  },
  updatedBy: {
    type: String,
    trim: true,
  },
  deletedBy: {
    type: String,
    trim: true,
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

const Verify = mongoose.model('Verify', verifySchema);
module.exports = Verify;