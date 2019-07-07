'use strict';

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const mongoose_delete = require ('mongoose-delete');
const counter = require ('../../../utils/counter.model');

const baseOptions = {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

let ModelSchema = new Schema (
  {
    modelID: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
    },
    imageList: [
      {
        url: {
          type: String,
        },
        thumbUrl:{
          type: String,
        },
        size: {
          type: Number,
        },
        percent: {
          type: Number,
        },
        lastModified: {
          type: Number,
        },
        name: {
          type: String,
        },
        uid: {
          type: String,
        },
        status: {
          type: String,
        },
        type: {
          type: String,
        },
      }
    ],
    brand: {
      type: Schema.Types.ObjectId,
      ref: 'Brand',
    },
  },
  baseOptions
);

ModelSchema.plugin (mongoose_delete, { overrideMethods: true });
ModelSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'modelID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.modelID = count.seq;

        next ();
      })
      .catch (function (error) {
        console.error ('counter error-> : ' + error);
        throw error;
      });
  } else {
    next ();
  }
});

module.exports = mongoose.model ('Model', ModelSchema);
