const _ = require('lodash');
const Service = require('../../core/service');
const {
  url,
  pin,
  terminal
} = require('./config');
let ParsianCheckout = require("./parsian");

const TransactionModel = require('./models/transactions.model');
const Parsian = ParsianCheckout.create(pin, terminal);

class TransactionsService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'transactions',
      version: '1.0.0',
      actions: {
        create: {
          handler: this.create,
        },
        check: {
          handler: this.check,
        },
        get: {
          handler: this.get,
        },
        list: {
          handler: this.list,
        }
      },
      methods: {},
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async list(ctx){
    this.logger.info ('transactions Service - list Action called.');

    const {orderType} = ctx.params;

    let transactions;
      transactions = await TransactionModel.find ()
      .populate("who")
      .populate( 'order' )
      .populate({
        path: "order",
        populate: {
          path: "car business customer contractor"
        }
      })
      .populate({
        path: "order",
        populate: {
          path: "business",
          populate: {
            path: "owner"
          }
        }
      })
      .exec ();

    if(orderType){
      transactions = _.map(transactions, function(o) {
          if (o.order && o.order.kind == orderType) return o;
      });
    }

    transactions = _.reject(transactions, _.isNil);

    return {
      ok: true,
      total: transactions.length,
      transactions: transactions,
    };
  }

  async create(ctx) {
    this.logger.info('Transactions Service - create Action called.');

    const {
      user
    } = ctx.params;

    const {
      amount,
      order,
      details,
      due,
      origin,
    } = ctx.params;


    let newTransaction;
    try {
      newTransaction = new TransactionModel({
        amount,
        due,
        details,
        order,
        origin,
        who: user ? user.id : origin
      });
      await newTransaction.save();
    } catch (error) {
      return{
        ok: false
      }
    }
    

    if (due === 'bank') {

      let callbackURL = url + '/transactions/check/' + newTransaction.hash;

      if(order){
        callbackURL += '/' + order
      }

      const callback = await Parsian.PaymentRequest({
        Amount: amount  * 10,
        OrderId: newTransaction.transactionID,
        CallBackUrl: callbackURL
      });

      newTransaction.status = callback.status;
      newTransaction.token = callback.token;
      await newTransaction.save();

      const cleanedNewTransaction = _.omit(newTransaction.toObject(), ['__v', '_id']);

      return {
        ok: true,
        transaction: cleanedNewTransaction,
        url: callback.url
      };
    }else if(due === 'order'){
      const user = await this.broker.call("1.0.0.users.get", {
        id: origin + '',
        many: false
      });

      await this.broker.call("1.0.0.users.update", {
        id: origin + '',
        wallet: user.user.wallet - amount
      });

      newTransaction.state = 'succeeded';
      await newTransaction.save();

      return {
        ok: true,
        transaction: newTransaction
      };
    }else if(due === 'checkout'){
      const user = await this.broker.call("1.0.0.users.get", {
        id: origin + '',
        many: false
      });

      await this.broker.call("1.0.0.users.update", {
        id: origin + '',
        income: user.user.income + amount
      });

      newTransaction.state = 'succeeded';
      await newTransaction.save();

      return {
        ok: true,
        transaction: newTransaction
      };
    }

    const cleanedNewTransaction = _.omit(newTransaction.toObject(), ['__v', '_id']);
    return {
      ok: true,
      transaction: cleanedNewTransaction,
    }
  }

  async get(ctx) {
    this.logger.info('Transactions Service - get Action called.');

    const {
      user
    } = ctx.params;

    if(!user){
      return{
        ok: false,
        message: 'عملیات مجاز نمی باشد'
      }
    }

    const {
      id,
      limit,
      skip,
      many
    } = ctx.params;

    let {
      oldest
    } = ctx.params;

    if (_.isNil(oldest)) {
      oldest = true;
    }

    let query = {
      _id:id,
    };
    let options = {
      limit,
      skip,
      sort: {
        createdAt: (oldest) ? 1 : -1,
      },
    };

    query = _.omitBy(query, _.isNil);
    options = _.omitBy(options, _.isNil);

    if (many) {
      const transactions = await TransactionModel.find(query, {}, options).exec();

      if (_.isNil(transactions) || !_.isArray(transactions)) {
        return {
          ok: false,
          message: 'تراکنش های مورد نظر یافت نشد'
        };
      }

      const cleanedTransactions = [];

      for (const key in transactions) {
        const element = transactions[key];
        const result = _.omit(element.toObject(), ['__v', '_id']);
        cleanedTransactions.push(result);
      }

      const count = cleanedTransactions.length;

      return {
        ok: true,
        total: count,
        transactions: cleanedTransactions,
      };
    }

    const transactionFinded = await TransactionModel.findOne(query, {}, options).exec();

    if (_.isNil(transactionFinded)) {
      return {
        ok: false,
        message: 'تراکنش مورد نظر یافت نشد'
      };
    }

    const transaction = _.omit(transactionFinded.toObject(), ['__v', '_id']);

    return {
      ok: true,
      transaction,
    };
  }

  async check(ctx) {
    this.logger.info('Transactions Service - check Action called.');

    const {
      hash
    } = ctx.params;

    let transaction = await TransactionModel.findOne({
      hash: hash
    }).exec();

    let callback = await Parsian.PaymentVerification({
      Token: transaction.token
    });

    transaction.rrn = callback.rrn;
    transaction.status = callback.status;

    if(transaction.status == 0){
      transaction.state = 'succeeded';
    }else if(transaction.status == -22 || transaction.status == -21){
      transaction.state = 'failed';
    }else if(transaction.status == -1531){
      transaction.state = 'cancel';
    }else{
      transaction.state = 'unknown';
    }

    await transaction.save();

    let callResult;
    if(transaction.status == 0){
      try {
        const user = await this.broker.call("1.0.0.users.get", {
          id: transaction.origin + '',
          many: false
        });

        callResult = await this.broker.call("1.0.0.users.update", {
          id: transaction.origin + '',
          wallet: user.user.wallet + transaction.amount
        });
      } catch (error) {
          return {
            ok: false,
            message: error.message,
            data: error.data
          }
      }
    }

    const cleanedTransaction = _.omit(transaction.toObject(), ['__v', '_id']);
    return {
      ok: (transaction.status == 0) && callResult.ok,
      transaction: cleanedTransaction
    };
  }

  serviceCreated() {
    this.logger.info('Verify Service created.');
  }

  serviceStarted() {
    this.logger.info('Verify Service started.');
  }

  serviceStopped() {
    this.logger.info('Verify Service stopped.');
  }
}

module.exports = TransactionsService;