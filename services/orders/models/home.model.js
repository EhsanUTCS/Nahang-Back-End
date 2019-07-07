const Base = require ('./orders.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let HomeSchema = new Schema ({
  numOfDay: {
    type: Number,
    default: 1,
  },
  rooms: {
    type: String,
  },
  type: {
    type: String,
  },
  capacity: {
    type: String,
  },
  filming: {
    type: Boolean,
    default: false,
  },
  wedding: {
    type: Boolean,
    default: false,
  },
  birthday: {
    type: Boolean,
    default: false,
  },
  time: {
    hour: {
      type: String,
    },
    minute: {
      type: String,
    },
  },
  date: {
    day: {
      type: String,
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
  },
});

const Home = Base.discriminator ('HomeOrder', HomeSchema);
module.exports = Home;
