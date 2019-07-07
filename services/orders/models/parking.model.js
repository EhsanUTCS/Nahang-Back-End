const Base = require ('./orders.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let ParkingSchema = new Schema ({
  car: {
    type: Schema.Types.ObjectId,
    ref: 'Cars',
  },
  diff: {
    type: String,
  },
  fuel: {
    type: Number,
    default: 0
  },
  cleaning: {
    type: Boolean,
    default: false,
  },
  carWash: {
    type: Boolean,
    default: false,
  },
});

const Parking = Base.discriminator ('ParkingOrder', ParkingSchema);
module.exports = Parking;
