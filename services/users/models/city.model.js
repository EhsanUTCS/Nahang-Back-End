const mongoose = require ('mongoose');
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const citySchema = mongoose.Schema (
  {
    cityID: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

citySchema.index ({
  cityID: 'text',
  name: 'text',
});

citySchema.plugin (mongoose_delete, { overrideMethods: true });

citySchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'cityID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.cityID = count.seq;
        next ();
      })
      .catch (function (error) {
        console.error ('counter error-> : ' + error);
        throw error;
      });
  } else {
    next ();
  }
});

const city = mongoose.model ('City', citySchema);
module.exports = city;
