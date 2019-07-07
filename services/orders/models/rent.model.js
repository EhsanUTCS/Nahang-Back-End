const Base = require ('./orders.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let RentSchema = new Schema ({
  numOfDay: {
    type: Number,
    default: 1,
  },
  model: {
    type: Schema.Types.ObjectId,
    ref: 'Model',
  },
  suburban: {
    type: Boolean,
    default: false,
  },
  filming: {
    type: Boolean,
    default: false,
  },
  wedding: {
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

const Rent = Base.discriminator ('RentOrder', RentSchema);
module.exports = Rent;
