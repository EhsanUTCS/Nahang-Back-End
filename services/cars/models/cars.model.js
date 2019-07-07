'use strict';

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let CarsSchema = new Schema (
  {
    model: {
      type: String,
    },
    color: {
      type: String,
    },
    code: [{type: String}],
    owner: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

module.exports = mongoose.model ('Cars', CarsSchema);
