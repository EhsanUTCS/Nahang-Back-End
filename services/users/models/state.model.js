const mongoose = require ('mongoose');
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const stateSchema = mongoose.Schema (
  {
    stateID: {
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

stateSchema.index ({
  stateID: 'text',
  name: 'text',
});


stateSchema.plugin (mongoose_delete, { overrideMethods: true });

stateSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'stateID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.stateID = count.seq;
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

const state = mongoose.model ('State', stateSchema);
module.exports = state;
