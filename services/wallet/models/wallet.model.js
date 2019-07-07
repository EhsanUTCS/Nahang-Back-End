"use strict";

const mongoose = require("mongoose");
const uuidv4 = require('uuid/v4');
const Schema = mongoose.Schema;

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
        enum: ['wait', 'succeeded','failed','unknown'],
        default: 'wait'
    },
    amount: Number,
    origin: { 
        type: mongoose.Schema.Types.ObjectId 
    },
    status: Number,
    authority: String,
    refId: Number,
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

module.exports = mongoose.model("Transaction", TransactionSchema);
