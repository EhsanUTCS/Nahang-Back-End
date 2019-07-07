"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let SpecialtiesSchema = new Schema({
    specialtyID: {
        type: String,
        trim: true,
        index: {
          unique: true,
          partialFilterExpression: {username: {$type: 'string'}}
        }
    },
    kind: {
        type: String,
        enum: ['cleaning'],
        default: 'cleaning'
    },
    data: {
        type: Schema.Types.Mixed,
    },
    owner: {type: mongoose.Schema.Types.ObjectId}
}, {
    timestamps: true,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});

SpecialtiesSchema.index({ "loc": "2dsphere" });

module.exports = mongoose.model("Specialties", SpecialtiesSchema);
