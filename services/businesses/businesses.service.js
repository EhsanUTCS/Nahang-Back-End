const _ = require ('lodash');
const Service = require ('../../core/service');
const BrandModel = require ('./models/brand.model');
const BrandModelModel = require ('./models/model.model');
const HomeModel = require ('./models/home.model');
const ParkingModel = require ('./models/parking.model');
const RentModel = require ('./models/rent.model');
const BusinessesModel = require ('./models/businesses.model');

class BusinessService extends Service {
  constructor (broker) {
    super (broker);

    this.parseServiceSchema ({
      name: 'businesses',
      version: '1.0.0',
      actions: {
        create: {
          handler: this.create,
        },
        get: {
          handler: this.get,
        },
        getById: {
          handler: this.getById,
        },
        getAll: {
          handler: this.getAll,
        },
        list: {
          handler: this.list,
        },
        remove: {
          handler: this.remove,
        },
        update: {
          handler: this.update,
        },
        active: {
          handler: this.active,
        },
        deactive: {
          handler: this.deactive,
        },
        getByOwner: {
          handler: this.getByOwner,
        },
        decreaseParking: {
          handler: this.decreaseParking,
        },
        increaseParking: {
          handler: this.increaseParking,
        },
        count: {
          handler: this.count,
        },
        getBrands: {
          handler: this.getBrands,
        },
        getBrand: {
          handler: this.getBrand,
        },
        brandsList: {
          handler: this.brandsList,
        },
        createBrand: {
          handler: this.createBrand,
        },
        updateBrand: {
          handler: this.updateBrand,
        },
        removeBrand: {
          handler: this.removeBrand,
        },
        getModels: {
          handler: this.getModels,
        },
        getModel: {
          handler: this.getModel,
        },
        modelsList: {
          handler: this.modelsList,
        },
        createModel: {
          handler: this.createModel,
        },
        updateModel: {
          handler: this.updateModel,
        },
        removeModel: {
          handler: this.removeModel,
        },
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async getBrands(ctx) {
    this.logger.info(`${this.name}-${this.version} getBrands`);

    let brands = await BrandModel.find().exec();

    return this.Promise.resolve({
      ok: true,
      brands,
    });
  }

  async getBrand(ctx) {
    this.logger.info(`${this.name}-${this.version} getBrand`);

    const { id } = ctx.params;

    let finded = await BrandModel.findById(id).exec();

    if (_.isNil(finded)) {
      return {
        ok: false,
        status: 404,
        message: 'برند مورد نظر یافت نشد',
      };
    }

    const brand = _.omit(finded.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      brand,
    });
  }

  async brandsList(ctx) {
    this.logger.info(`${this.name}-${this.version} brandsList`);

    const brands = await BrandModel.find().exec();
    return this.Promise.resolve({
      ok: true,
      brands,
      count: brands.length || 0,
    });
  }

  async createBrand(ctx) {
    this.logger.info(`${this.name}-${this.version} createBrand`);

    let data = {
      ...ctx.params,
    };

    data = _.omitBy(data, _.isNil);
    data = _.omitBy(data, _.isEmpty);

    const newBrand = new BrandModel(data);
    await newBrand.save();

    const brand = _.omit(newBrand.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      brand,
    });
  }
  
  async updateBrand(ctx) {
    this.logger.info(`${this.name}-${this.version} updateBrand`);

    const { id } = ctx.params;

    let data = {
      ...ctx.params,
      id: null,
    };
    data = _.omitBy(data, _.isNil);


    let finded = await BrandModel.findById(id + '').exec();
    if (_.isEmpty(finded)) {
      return {
        ok: false,
        message: 'برند مورد نظر یافت نشد',
      };
    }

    let result = await BrandModel.findByIdAndUpdate(id + '', data, {
      new: true,
    }).exec();
    result = _.omit(result.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      brand: result,
    });
  }

  async removeBrand(ctx) {
    this.logger.info(`${this.name}-${this.version} removeBrand`);

    const { id } = ctx.params;

    const result = await BrandModel.deleteById(id).exec();

    return this.Promise.resolve({
      ok: !_.isNil(result),
    });
  }

  async getModels(ctx) {
    this.logger.info(`${this.name}-${this.version} getModels`);

    const { id } = ctx.params;

    let models = await BrandModelModel.find({
      brand: id
    }).exec();

    return this.Promise.resolve({
      ok: true,
      models,
    });
  }

  async getModel(ctx) {
    this.logger.info(`${this.name}-${this.version} getModel`);

    const { id } = ctx.params;

    let finded = await BrandModelModel.findById(id)
    .populate("brand")

    .exec();

    if (_.isNil(finded)) {
      return {
        ok: false,
        status: 404,
        message: 'مدل ماشین مورد نظر یافت نشد',
      };
    }

    const model = _.omit(finded.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      model,
    });
  }

  async modelsList(ctx) {
    this.logger.info(`${this.name}-${this.version} modelsList`);

    const models = await BrandModelModel.find()        
    .populate("brand")
    .exec();

    return this.Promise.resolve({
      ok: true,
      models,
      count: models.length || 0,
    });
  }

  async createModel(ctx) {
    this.logger.info(`${this.name}-${this.version} createModel`);

    let data = {
      ...ctx.params,
    };

    data = _.omitBy(data, _.isNil);
    data = _.omitBy(data, _.isEmpty);

    const newModel = new BrandModelModel(data);
    await newModel.save();

    const model = _.omit(newModel.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      model,
    });
  }
  
  async updateModel(ctx) {
    this.logger.info(`${this.name}-${this.version} updateModel`);

    const { id } = ctx.params;

    let data = {
      ...ctx.params,
      id: null,
    };
    data = _.omitBy(data, _.isNil);


    let finded = await BrandModelModel.findById(id + '').exec();
    if (_.isEmpty(finded)) {
      return {
        ok: false,
        message: 'مدل مورد نظر یافت نشد',
      };
    }

    let result = await BrandModelModel.findByIdAndUpdate(id + '', data, {
      new: true,
    }).exec();
    result = _.omit(result.toObject(), ['__v', '_id']);

    return this.Promise.resolve({
      ok: true,
      model: result,
    });
  }

  async removeModel(ctx) {
    this.logger.info(`${this.name}-${this.version} removeModel`);

    const { id } = ctx.params;

    const result = await BrandModelModel.deleteById(id).exec();

    return this.Promise.resolve({
      ok: !_.isNil(result),
    });
  }

  async update(ctx) {
    this.logger.info (`${this.name}-${this.version} update`);

    const {id} = ctx.params;

    let data = {
      ...ctx.params,
      id: null,
    };
    data = _.omitBy (data, _.isNil);
    data = _.omitBy (data, _.isEmpty);


    let Finded = await BusinessesModel.findById (id + '').exec ();
    if (_.isEmpty (Finded)) {
      return {
        ok: false,
        message: 'کسب و کار مورد نظر یافت نشد',
      };
    }

    let result;
    if(Finded.kind == 'Parking'){
      result = await ParkingModel.findByIdAndUpdate (id + '', data, {
        new: true,
      }).exec ();
      result = _.omit (result.toObject (), ['__v', '_id']);
    }else if(Finded.kind == 'Home'){
      result = await HomeModel.findByIdAndUpdate (id + '', data, {
        new: true,
      }).exec ();
      result = _.omit (result.toObject (), ['__v', '_id']);
    }else if(Finded.kind == 'Rent'){
      result = await RentModel.findByIdAndUpdate (id + '', data, {
        new: true,
      }).exec ();
      result = _.omit (result.toObject (), ['__v', '_id']);
    }

    return this.Promise.resolve ({
      ok: true,
      business: result,
    });
  }

  async remove (ctx) {
    this.logger.info (`${this.name}-${this.version} Remove`);

    const {id} = ctx.params;

    const result = await BusinessesModel.deleteById (id).exec ();

    return this.Promise.resolve ({
      ok: !_.isNil (result),
    });
  }

  async count(ctx) {
    this.logger.info(`${this.name}-${this.version} Count`);

    let count = await BusinessesModel.count({}).exec();

    return this.Promise.resolve({
      ok: true,
      count
    });
  }

  async create (ctx) {
    this.logger.info ('Businesses Service - create Action called.');

    const {loc, kind, user} = ctx.params;

    const data  ={
      ...ctx.params,
      owner: user.id,
      loc: {
        type: 'Point',
        coordinates: loc.coordinates,
      },
    };

    let business;
    if(kind == 'Home'){
      business = new HomeModel(data);
    }else if(kind == 'Rent'){
      business = new RentModel(data);
    }else if(kind == 'Parking'){
      business = new ParkingModel(data);
    }else{
      return {
        ok: false,
        message: "نوع کسب و کار نا معتبر می باشد",
      };
    }
    await business.save();

    return {
      ok: true,
      business: business.toObject (),
    };
  }

  async active (ctx) {
    const {id} = ctx.params;

    const business = await BusinessesModel.findById (id).exec ();
    if (_.isNil (business)) {
      return {
        ok: false,
      };
    }

    business.active = true;
    await business.save ();

    return {
      ok: true,
    };
  }

  async deactive (ctx) {
    const {id} = ctx.params;

    const business = await BusinessesModel.findById (id).exec ();
    if (_.isNil (business)) {
      return {
        ok: false,
      };
    }

    business.active = false;
    await business.save ();

    return {
      ok: true,
    };
  }

  async get (ctx) {
    this.logger.info ('Businesses Service - get Action called.');

    const {id} = ctx.params;
    var business = await BusinessesModel.findById (id).exec ();

    return {
      ok: true,
      business,
    };
  }

  async getAll (ctx) {
    this.logger.info ('Businesses Service - getAll Action called.');

    const {user, kind, rooms, zarfiyat, type, ownerID, withID} = ctx.params;

    let data = {};
    if (withID) {
      data = {
        ownerID,
        kind,
      };
    } else {
      data = {
        rooms,
        zarfiyat,
        type,
        kind,
      };
      data = _.omitBy (data, _.isNil);
      data = _.omitBy (data, _.isEmpty);
    }

    data.active = true;

    var businesses = await BusinessesModel.find (data).exec ();

    return {
      ok: true,
      total: businesses.length,
      businesses: businesses,
    };
  }

  async list (ctx) {
    this.logger.info ('Businesses Service - getAll Action called.');

    const {kind} = ctx.params;

    let data = {
      kind,
    };

    data = _.omitBy(data, _.isNil);
    data = _.omitBy(data, _.isEmpty);

    var businesses = await BusinessesModel.find (data)      
    .populate("owner").exec ();

    return {
      ok: true,
      total: businesses.length,
      businesses: businesses,
    };
  }

  async getByOwner (ctx) {
    this.logger.info ('Businesses Service - get Action called.');

    const {user} = ctx.params;

    var businesses = await BusinessesModel.find ({
      owner: user.id,
    }).exec ();

    return {
      ok: true,
      total: businesses.length,
      businesses,
    };
  }

  async getById (ctx) {
    this.logger.info ('Businesses Service - getById Action called.');

    const {user, id} = ctx.params;

    var business = await BusinessesModel.findById (id).exec ();

    if (_.isEmpty (business)) {
      return {
        ok: false,
      };
    }

    return {
      ok: true,
      business,
    };
  }

  async increaseParking (ctx) {
    this.logger.info (`${this.name}-${this.version} increase`);

    const {id} = ctx.params;

    const Finded = await ParkingModel.findById (id).exec ();
    if (_.isNil (Finded)) {
      return {
        ok: false,
      };
    }

    if (Finded.kind != 'Parking') {
      return {
        ok: true,
      };
    }

    let result = await ParkingModel.findByIdAndUpdate (id, {
      $inc: {
        'capacity': 1,
      },
    }).exec ();
    result = _.omit (result.toObject (), ['__v', '_id']);

    return {
      ok: true,
    };
  }

  async decreaseParking (ctx) {
    this.logger.info (`${this.name}-${this.version} decrease`);

    const {id} = ctx.params;

    const Finded = await BusinessesModel.findById (id).exec ();
    if (_.isNil (Finded)) {
      return {
        ok: false,
      };
    }

    if (Finded.kind != 'Parking') {
      return {
        ok: true,
      };
    }

    if (Finded.capacity < 1) {
      return {
        ok: false,
      };
    }

    let result = await ParkingModel.findByIdAndUpdate (id, {
      $inc: {
        'capacity': -1,
      },
    },{new: true}).exec ();
    result = _.omit (result.toObject (), ['__v', '_id']);

    return this.Promise.resolve ({
      ok: true,
      business: result
    });
  }

  async getNear (ctx) {
    this.logger.info ('Businesses Service - getNear Action called.');

    const {loc} = ctx.params;

    var businesses = await BusinessesModel.aggregate ([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: loc,
          },
          distanceField: 'distance',
          spherical: true,
          maxDistance: 100000,
        },
      },
    ]);

    return {
      ok: true,
      businesses: businesses.toObject (),
    };
  }

  serviceCreated () {
    this.logger.info ('Verify Service created.');
  }

  serviceStarted () {
    this.logger.info ('Verify Service started.');
  }

  serviceStopped () {
    this.logger.info ('Verify Service stopped.');
  }
}

module.exports = BusinessService;
