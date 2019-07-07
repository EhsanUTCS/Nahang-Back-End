const _ = require('lodash');
const Service = require('../../core/service');
const RequestsModel = require('./models/requests.model');

class RequestsService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'requests',
      version: '1.0.0',
      actions: {
        create: {
          handler: this.create,
        },
        getServes: {
          handler: this.getServes,
        },
        getEmployer: {
          handler: this.getEmployer,
        },
        getContractor: {
          handler: this.getContractor,
        },
        setContractor: {
          handler: this.setContractor,
        },
      },
      methods: {},
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async create(ctx) {
    this.logger.info('Businesses Service - create Action called.');

    const {
      kind,
      address,
      serve,
      data,
      state,
      user
    } = ctx.params;

    var request = new RequestsModel({ 
      kind,
      address,
      serve,
      data,
      state,
      employer: user.id
    });
    await request.save()

    return {
      ok: true,
      request: request.toObject()
    }
  }

  async getServes(ctx) {
    this.logger.info('Businesses Service - getServes Action called.');

    const {
      serves
    } = ctx.params;

    const requests = await RequestsModel.find({
      serve: { "$in" : serves} 
    });

    return {
      ok: true,
      requests: requests.toObject()
    }
  }

  async getEmployer(ctx) {
    this.logger.info('Businesses Service - getEmployer Action called.');

    const {
      employer
    } = ctx.params;

    const requests = await RequestsModel.find({
      employer
    });

    return {
      ok: true,
      requests: requests.toObject()
    }
  }

  async getContractor(ctx) {
    this.logger.info('Businesses Service - getContractor Action called.');

    const {
      contractor
    } = ctx.params;

    const requests = await RequestsModel.find({
      contractor
    });

    return {
      ok: true,
      requests: requests.toObject()
    }
  }

  async setContractor(ctx) {
    this.logger.info('Businesses Service - setContractor Action called.');

    const {
      id,
      contractor
    } = ctx.params;

    const request = await RequestsModel.findById(id);
    request.contractor = contractor;
    request.state = 'doing';
    request.save()

    return {
      ok: true,
      request: request.toObject()
    }
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

module.exports = RequestsService;