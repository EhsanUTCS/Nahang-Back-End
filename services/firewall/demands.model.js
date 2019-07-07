"use strict";

let mongoose = require("mongoose");
let randomString = require("randomstring");

let Schema = mongoose.Schema;

let DemandSchema = new Schema({
    demandId: {
		type: String,
		unique: true,
		default: function() {
			return "D" + randomString.generate({
				length: 16,
				charset: "0123456789"
			});
		}
	},
    host: {
		type: String,
		trim: true,
		index: true,
		lowercase: true,
        required: true
    },
    userAgent: {
        type: String,
        trim: true,
        index: true,
        required: true
    },
    ip: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    origin: {
        type: String,
        trim: true,
        index: true,
        lowercase: true
    },
    request: {
        type: String,
        trim: true,
        index: true,
        lowercase: true,
        required: true
    },
    userId: {
        type: String,
        trim: true,
        index: true
    },
}, {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
});

DemandSchema.index({
	"ip": "text",
    "userId": "text",
    "userAgent": "text",
	"demandId": "text",
    "origin": "text",
    "request": "text"
});

module.exports = mongoose.model("Demand", DemandSchema);
