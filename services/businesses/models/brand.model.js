'use strict';

const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const baseOptions = {
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

let BrandSchema = new Schema (
  {
    brandID: {
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
    model: [{type: Schema.Types.ObjectId, ref: 'Model'}],
  },
  baseOptions
);


BrandSchema.plugin (mongoose_delete, { overrideMethods: true });

BrandSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'brandID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.brandID = count.seq;

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

module.exports = mongoose.model ('Brand', BrandSchema);
