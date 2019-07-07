const Base = require ('./businesses.model');
const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

let HomeSchema = new Schema ({
  dailyPrice: {
    type: Number,
    default: 50000
  },
  rooms: {
    type: String,
  },
  type: {
    type: String,
  },
  features: {
    type: String,
  },
  capacity: {
    type: String,
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
  birthday: {
    type: Boolean,
    default: false,
  },
  birthdayPrice: {
    type: Number,
    default: 50000
  },
  imageList: [
    {
      url: {
        type: String,
      },
      thumbUrl:{
        type: String,
      },
      size: {
        type: Number,
      },
      percent: {
        type: Number,
      },
      lastModified: {
        type: Number,
      },
      name: {
        type: String,
      },
      uid: {
        type: String,
      },
      status: {
        type: String,
      },
      type: {
        type: String,
      },
    }
  ]
});

const Home = Base.discriminator ('Home', HomeSchema);
module.exports = Home;
