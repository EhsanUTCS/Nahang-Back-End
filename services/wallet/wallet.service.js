const _ = require('lodash');
const Service = require('../../core/service');
// const WalletModel = require('./models/wallet.model');
const increaseParams = require('./params/increase.param');

class VerifyService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'wallet',
      version: '1.0.0',
      actions: {
        increase: {
          params: increaseParams,
          handler: this.increase,
        },
        transfer: {
          handler: this.transfer,
        }
      },
      methods: {
        carCode: this.carCode
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async increase(ctx) {
    this.logger.info('Transactions Service - create Action called.');

    const {
      amount,
      order,
      origin,
      user
    } = ctx.params;

    try {
      const callResult = await this.broker.call("1.0.0.transactions.create", {
        amount,
        order,
        origin,
        user,
        due: 'bank'
      });

      return callResult;
    } catch (error) {
        return {
          ok: false,
          message: error.message,
          data: error.data
        }
    }
  }

  async transfer(ctx) {
    this.logger.info('Transactions Service - transfer Action called.');

    const {
      from,
      to,
      price,
      details
    } = ctx.params;

    let info = '';

    // if(details.order.business && details.order.business.kind === 'Parking'){
    //   info += details.order.car.model + ' - ' + details.order.car.color + ' - ' + this.carCode(details.order.car)
    // }else
    {
      info += details.order.customer.name + ' - ' + details.order.customer.userID
    }

    try {
      let res = await this.broker.call("1.0.0.transactions.create", {
        amount: price,
        origin: from + '',
        due: 'order',
        details: details.order.business.name,
        order: details.order.id
      });

      res = await this.broker.call("1.0.0.transactions.create", {
        amount: price,
        origin: to + '',
        due: 'checkout',
        details: info,
        order: details.order.id
      });

    } catch (error) {
        return {
          ok: false,
          message: error.message,
          data: error.data
        }
    }

    return {
      ok: true
    }
  }


  carCode (item) {
    return (
      'ایران ' +
      item.code[0] +
      ' - ' +
      item.code[1] +
      ' ' +
      item.code[2] +
      ' ' +
      item.code[3]
    );
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

module.exports = VerifyService;