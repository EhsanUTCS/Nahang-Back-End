const Base = require ('./businesses.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let RentSchema = new Schema ({
  dailyPrice: {
    type: Number,
    default: 50000
  },
  model: {
    type: Schema.Types.ObjectId,
    ref: 'Model',
  },
  brand: {
    type: Schema.Types.ObjectId,
    ref: 'Brand',
  },
  temporaryModel: {
    type: String,
  },
  temporaryBrand: {
    type: String,
  },
  color: {
    type: String,
  },
  year: {
    type: String,
  },
  code: [{type: String}],
  features: {
    type: String,
  },
  suburban: {
    type: Boolean,
    default: false,
  },
  suburbanPrice: {
    type: Number,
    default: 50000
  },
  filming: {
    type: Boolean,
    default: false,
  },
  filmingPrice: {
    type: Number,
    default: 50000
  },
  wedding: {
    type: Boolean,
    default: false,
  },
  weddingPrice: {
    type: Number,
    default: 50000
  },
});

const Rent = Base.discriminator ('Rent', RentSchema);
module.exports = Rent;
