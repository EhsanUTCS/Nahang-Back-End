const mongoose = require ('mongoose');

const CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
const counter = mongoose.model('counter', CounterSchema);
module.exports = counter;