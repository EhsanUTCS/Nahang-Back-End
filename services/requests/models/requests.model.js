"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let RequestsSchema = new Schema({
    kind: {
        type: String,
        enum: ['businesses', 'specialties']
    },
    address: {
        type: String,
    },
    serve:{
        type: String,
    },
    data: {
        type: mongoose.Schema.Types.Mixed
    },
    state: {
        type: String,
        enum: ['wait', 'doing','checkout','succeeded','cancel'],
        default: 'wait'
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId
    },
    contractor: {
        type: mongoose.Schema.Types.ObjectId
    }
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});


module.exports = mongoose.model("Requests", RequestsSchema);
