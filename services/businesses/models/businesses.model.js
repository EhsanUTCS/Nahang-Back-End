const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const baseOptions = {
  discriminatorKey: 'kind',
  collection: 'businesses',
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

let BusinessesSchema = new Schema ({
    businessID: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    loc: {
      type: {
        type: String,
      },
      coordinates: [Number],
    },
    address: {
      type: String,
    },
    active: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId, ref: 'User'
    },
},baseOptions);

BusinessesSchema.index ({
  loc: '2dsphere',
});

BusinessesSchema.plugin (mongoose_delete, { overrideMethods: true });

BusinessesSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'businessID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.name = 'نهنگ ' + count.seq;
        doc.businessID = count.seq;

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

module.exports = mongoose.model ('Businesses', BusinessesSchema);
