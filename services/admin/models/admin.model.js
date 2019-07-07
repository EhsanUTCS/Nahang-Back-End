const mongoose = require ('mongoose');
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const adminSchema = mongoose.Schema (
  {
    adminID: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    password: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      required: true,
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

adminSchema.index ({
  adminID: 'text',
  name: 'text',
  email: 'text',
});

adminSchema.plugin (mongoose_delete, { overrideMethods: true });

adminSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'adminID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        console.log ('...count: ' + JSON.stringify (count));
        doc.userID = count.seq;
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

const Admin = mongoose.model ('Admin', adminSchema);
module.exports = Admin;
