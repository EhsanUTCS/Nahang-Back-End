const _ = require('lodash');
const Service = require('../../core/service');
const {
  expires
} = require('../../config');

const VerifyModel = require('./models/verify.model');

const createParams = require('./params/create.param');
const checkParams = require('./params/check.param');

class VerifyService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'verify',
      version: '1.0.0',
      actions: {
        create: {
          params: createParams,
          handler: this.create,
        },
        check: {
          params: checkParams,
          handler: this.check,
        },
      },
      methods: {
        createMobileVerify: this.createMobileVerify
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async create(ctx) {
    this.logger.info('Verify Service - create Action called.');

    const {
      recipent
    } = ctx.params;

    const verify = await this.createMobileVerify(recipent);

    return {
      ok: true,
      hash: verify.hash
    }
  }

  async check(ctx) {
    this.logger.info('Verify Service - check Action called.');

    const {
      code,
      hash
    } = ctx.params;


    let verify = await VerifyModel.findOne({
      hash
    }).exec();

    if(_.isEmpty(verify)){
      return {
        ok: false,
        message: "کد تایید نامعتبر می باشد"
      }
    }

    if (new Date(verify.createdAt) + expires.verify < new Date()) {
      return {
        ok: false,
        message: "کد تایید منقضی شده است"
      }
    } else if (verify.used) {
      return {
        ok: false,
        message: "این کد تایید قبلا استفاده شده است"
      }
    } else if (verify && verify.code === code) {
      verify.used = true;
      await verify.save();

      return {
        ok: true,
        verify: verify.toObject()
      }
    }

    return {
      ok: false,
      message: "کد تایید نامعتبر می باشد"
    }
  }

  async createMobileVerify(recipent) {
    let verify = new VerifyModel({
      for: recipent
    });
    await verify.save();

    this.broker.emit("verify.sendMobile", {
      recipent,
      code: verify.code
    });

    return verify.toObject();
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