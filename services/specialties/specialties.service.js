const _ = require('lodash');
const Service = require('../../core/service');
const SpecialtyModel = require('./models/specialties.model');
const newSpecialtyID = require('./logic/newSpecialtyID');

class SpecialtiesService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'specialties',
      version: '1.0.0',
      actions: {
        create: {
          handler: this.create,
        },
        getAll: {
          handler: this.getAll,
        },
        getByOwner: {
          handler: this.getByOwner,
        }
      },
      methods: {},
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async create(ctx) {
    this.logger.info('Specialties Service - create Action called.');

    const {
      kind,
      data,
      user
    } = ctx.params;

    var specialty = new SpecialtyModel({ 
      specialtyID: await newSpecialtyID(),
      kind,
      data,
      owner: user.id
    });
    await specialty.save()

    return {
      ok: true,
      specialty: specialty.toObject()
    }
  }

  async getAll(ctx) {
    this.logger.info('Specialties Service - getAll Action called.');

    const {
      user
    } = ctx.params;

    var specialties = await SpecialtyModel.find({}).exec();

    return {
      ok: true,
      total: specialties.length,
      specialties: specialties
    }
  }

  async getByOwner(ctx) {
    this.logger.info('Specialties Service - get Action called.');

    const {
      user
    } = ctx.params;

    var specialties = await SpecialtyModel.find({
      owner: user.id
    }).exec();

    return {
      ok: true,
      total: specialties.length,
      specialties: specialties
    }
  }

  serviceCreated() {
    this.logger.info('Specialties Service created.');
  }

  serviceStarted() {
    this.logger.info('Specialties Service started.');
  }

  serviceStopped() {
    this.logger.info('Specialties Service stopped.');
  }
}

module.exports = SpecialtiesService;