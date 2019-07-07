const mongoose = require ('mongoose');
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const userSchema = mongoose.Schema (
  {
    userID: {
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
    mobile: {
      type: String,
      unique: true,
      trim: true,
      index: true,
      required: true,
    },
    nationalCode: {
      type: String,
      trim: true,
      default: null,
    },
    nationalId: {
      type: String,
      trim: true,
      default: null,
    },
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State',
    },
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    },
    wallet: {
      type: Number,
      default: 0,
    },
    income: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    rate: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    sex: {
      type: String,
      enum: ['female', 'male'],
    },
    birthDate: {
      type: Date,
    },
    register: {
      type: Boolean,
      default: true,
    },
    permissions:{
      rentBusiness: {
        type: Boolean,
        default: false,
      },
      homeBusiness: {
        type: Boolean,
        default: false,
      },
      parkingBusiness: {
        type: Boolean,
        default: false,
      },
      rentOrder: {
        type: Boolean,
        default: false,
      },
      homeOrder: {
        type: Boolean,
        default: false,
      },
    }
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

userSchema.index ({
  userID: 'text',
  name: 'text',
  mobile: 'text',
});

userSchema.plugin (mongoose_delete, { overrideMethods: true });

userSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'userID'},
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

const User = mongoose.model ('User', userSchema);
module.exports = User;
