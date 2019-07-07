"use strict";

const mongoose = require("mongoose");
const uuidv4 = require('uuid/v4');
const Schema = mongoose.Schema;
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

let TransactionSchema = new Schema({
    hash: {
        type: String,
        unique: true,
        default: function() {
            return uuidv4();
        }
    },
    due: {
        type: String,
        enum: ['bank', 'order','checkout']
    },
    state: {
        type: String,
        enum: ['wait', 'succeeded','cancel','failed','unknown'],
        default: 'wait'
    },
    amount: Number,
    transactionID: Number,
    origin: { 
        type: mongoose.Schema.Types.ObjectId 
    },
    order: {
      type: Schema.Types.ObjectId, ref: 'Orders'
    },
    status: Number,
    token: String,
    details: String,
    rrn: Number,
    who: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

TransactionSchema.plugin (mongoose_delete, { overrideMethods: true });

TransactionSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'transactionID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.transactionID = parseInt(count.seq);
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

module.exports = mongoose.model("Transaction", TransactionSchema);
