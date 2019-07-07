const _ = require ('lodash');
const Service = require ('../../core/service');
const CarsModel = require ('./models/cars.model');

class CarsService extends Service {
  constructor (broker) {
    super (broker);

    this.parseServiceSchema ({
      name: 'cars',
      version: '1.0.0',
      actions: {
        create: {
          handler: this.create,
        },
        remove: {
          handler: this.remove,
        },
        get: {
          handler: this.get,
        },
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  async create (ctx) {
    this.logger.info ('Businesses Service - create Action called.');

    const {code, user} = ctx.params;

    const cars = await CarsModel.find ({
      'code': code
    });

    if(!_.isEmpty(cars)){
      return {
        ok: false,
        message: "قبلا این پلاک ثبت شده است"
      };
    }

    var car = new CarsModel ({
      ...ctx.params,
      owner: user.id,
    });
    await car.save ();

    return {
      ok: true,
      car: car.toObject (),
    };
  }

  async remove (ctx) {
    this.logger.info ('Cars Service - remove Action called.');

    const {id, user} = ctx.params;

    var car = await CarsModel.findByIdAndRemove ({
      _id: id,
      owner: user.id,
    });

    return {
      ok: true,
      ...car,
    };
  }

  async get (ctx) {
    this.logger.info ('Businesses Service - getContractor Action called.');

    const {user,id} = ctx.params;

    if(id){
      const car = await CarsModel.findById (id.toString()).exec();

      return {
        ok: true,
        car,
      };
    }else{
      const cars = await CarsModel.find ({
        owner: user.id,
      });

      return {
        ok: true,
        cars,
      };
    }

    return {
      ok: false
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

module.exports = CarsService;
