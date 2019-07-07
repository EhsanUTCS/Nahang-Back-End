const mongoose = require ('mongoose');
const Schema = mongoose.Schema;
const counter = require ('../../../utils/counter.model');
const mongoose_delete = require ('mongoose-delete');

const baseOptions = {
  discriminatorKey: 'kind',
  collection: 'orders',
  timestamps: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
};

let SurveySchema = new Schema({
  submitted: {
    type: Boolean,
    default: false,
  },
  rate: {
    type: Number,
    default: 0,
  },
  items: [
    {
      question: {
        type: String,
      },
      answer:  {
        type: String,
      },
    }
  ]
});

let OrdersSchema = new Schema (
  {
    orderID: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    business: {
      type: Schema.Types.ObjectId,
      ref: 'Businesses',
    },
    customer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    contractor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['waiting', 'confirmation', 'cancel', 'reject', 'doing', 'finish','checkout'],
      default: 'waiting',
    },
    endDate: {
      type: String,
    },
    startDate: {
      type: String,
    },
    transaction: {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
    survey: {
      contractor: {
        type: SurveySchema,
      },
      customer: {
        type: SurveySchema,
      },
    },
    checkout: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      default: 0,
    },
    remainingPrice: {
      type: Number,
      default: 0,
    },
  },
  baseOptions
);

OrdersSchema.plugin (mongoose_delete, { overrideMethods: true });
OrdersSchema.pre ('save', function (next) {
  var doc = this;

  if (this.isNew) {
    counter
      .findByIdAndUpdate (
        {_id: 'orderID'},
        {$inc: {seq: 1}},
        {new: true, upsert: true}
      )
      .then (function (count) {
        doc.orderID = count.seq;
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

module.exports = mongoose.model ('Orders', OrdersSchema);
