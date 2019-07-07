const Base = require ('./businesses.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let ParkingSchema = new Schema ({
  capacity: {
    type: Number,
    default: 0
  },
  entrancePrice: {
    type: Number,
    default: 5000
  },
  hourlyPrice: {
    type: Number,
    default: 3000
  },
  carWash: {
    type: Boolean,
    default: false,
  },
  carWashPrice: {
    type: Number,
    default: 5000
  },
  fuel: {
    type: Boolean,
    default: false,
  },
  fuelPrice: {
    type: Number,
    default: 1000
  },
  cleaning: {
    type: Boolean,
    default: false,
  },
  cleaningPrice: {
    type: Number,
    default: 5000
  },
  toilet: {
    type: Boolean,
    default: false,
  },
  workingHours: {
    type: String,
  },
});

const Parking = Base.discriminator ('Parking', ParkingSchema);
module.exports = Parking;
