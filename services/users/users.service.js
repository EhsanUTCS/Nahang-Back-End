'use strict';

const UserModel = require('./models/user.model');
const _ = require('lodash');
const statesData = require('./states.json');
const StateModel = require('./models/state.model');
const CityModel = require('./models/city.model');

/**
 * verify service
 */
module.exports = {
  name: 'users',
  version: '1.0.0',

  /**
       * Service settings
       */
  settings: {},

  /**
       * Service metadata
       */
  metadata: {},

  /**
       * Service dependencies
       */
  dependencies: [],

  /**
       * Actions
       */
  actions: {
    async create(ctx) {
      this.logger.info(`${this.name}-${this.version} Create`);

      const { mobile } = ctx.params;

      const checkMobile = await UserModel.findOne({
        mobile,
      });

      if (!_.isEmpty(checkMobile)) {
        return {
          ok: false,
          message: 'شماره موبایل قبلا استفاده شده است',
        };
      }

      let data = {
        ...ctx.params,
      };

      data = _.omitBy(data, _.isNil);
      data = _.omitBy(data, _.isEmpty);

      const newUser = new UserModel(data);
      await newUser.save();

      const cleanedNewUser = _.omit(newUser.toObject(), ['__v', '_id']);
      this.broker.emit('users.create', cleanedNewUser);

      return this.Promise.resolve({
        ok: true,
        user: cleanedNewUser,
      });
    },
    async search(ctx) {
      this.logger.info(`${this.name}-${this.version} Search`);

      const { query } = ctx.params;

      let resultUsers = [];

      let users = await UserModel.find({
        name: new RegExp(this.escapeRegex(query), 'gi'),
      }).exec();

      if (!_.isNil(users)) {
        for (const key in users) {
          const element = users[key];
          const result = _.omit(element.toObject(), ['__v', '_id']);
          resultUsers.push(result);
        }
      }

      users = await UserModel.find({
        mobile: new RegExp(this.escapeRegex(query), 'gi'),
      }).exec();

      if (!_.isNil(users)) {
        for (const key in users) {
          const element = users[key];
          const result = _.omit(element.toObject(), ['__v', '_id']);
          resultUsers.push(result);
        }
      }

      users = await UserModel.find({
        nationalCode: new RegExp(this.escapeRegex(query), 'gi'),
      }).exec();

      if (!_.isNil(users)) {
        for (const key in users) {
          const element = users[key];
          const result = _.omit(element.toObject(), ['__v', '_id']);
          resultUsers.push(result);
        }
      }

      users = await UserModel.find({
        nationalId: new RegExp(this.escapeRegex(query), 'gi'),
      }).exec();

      if (!_.isNil(users)) {
        for (const key in users) {
          const element = users[key];
          const result = _.omit(element.toObject(), ['__v', '_id']);
          resultUsers.push(result);
        }
      }

      resultUsers = _.uniqBy(resultUsers, 'id');

      return {
        ok: true,
        users: resultUsers,
      };
    },
    async statesList(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);

      const states = await StateModel.find({});
      return this.Promise.resolve({
        ok: true,
        states,
        count: states.length,
      });
    },
    async createState(ctx) {
      this.logger.info(`${this.name}-${this.version} createState`);

      let data = {
        ...ctx.params,
      };

      data = _.omitBy(data, _.isNil);
      data = _.omitBy(data, _.isEmpty);

      const newState = new StateModel(data);
      await newState.save();

      const cleanedNewState = _.omit(newState.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        state: cleanedNewState,
      });
    },
    async updateState(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);


      const { id } = ctx.params;

      let data = {
        ...ctx.params,
        id: null,
      };
      data = _.omitBy(data, _.isNil);


      let finded = await StateModel.findById(id + '').exec();
      if (_.isEmpty(finded)) {
        return {
          ok: false,
          message: 'استان مورد نظر یافت نشد',
        };
      }

      let result = await StateModel.findByIdAndUpdate(id + '', data, {
        new: true,
      }).exec();
      result = _.omit(result.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        state: result,
      });
    },
    async removeState(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);

      const { id } = ctx.params;

      const result = await StateModel.deleteById(id).exec();

      return this.Promise.resolve({
        ok: !_.isNil(result),
      });
    },
    async getState(ctx) {
      this.logger.info(`${this.name}-${this.version} getState`);

      const { id } = ctx.params;

      let stateFinded = await StateModel.findById(id).exec();

      if (_.isNil(stateFinded)) {
        return {
          ok: false,
          status: 404,
          message: 'استان مورد نظر یافت نشد',
        };
      }

      const state = _.omit(stateFinded.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        state,
      });
    },
    async getCity(ctx) {
      this.logger.info(`${this.name}-${this.version} getCity`);

      const { id } = ctx.params;

      let cityFinded = await CityModel.findById(id)
        .populate("state")
        .exec();

      if (_.isNil(cityFinded)) {
        return {
          ok: false,
          status: 404,
          message: 'کاربر مورد نظر یافت نشد',
        };
      }

      const city = _.omit(cityFinded.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        city,
      });
    },
    async citiesList(ctx) {
      this.logger.info(`${this.name}-${this.version} citiesList`);

      const cities = await CityModel.find({})
        .populate("state")
        .exec();
      return this.Promise.resolve({
        ok: true,
        cities,
        count: cities.length,
      });
    },
    async createCity(ctx) {
      this.logger.info(`${this.name}-${this.version} createState`);

      let data = {
        ...ctx.params,
      };

      data = _.omitBy(data, _.isNil);
      data = _.omitBy(data, _.isEmpty);

      const newCity = new CityModel(data);
      await newCity.save();

      const cleanedNewCity = _.omit(newCity.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        city: cleanedNewCity,
      });
    },
    async updateCity(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);


      const { id } = ctx.params;

      let data = {
        ...ctx.params,
        id: null,
      };
      data = _.omitBy(data, _.isNil);
      data = _.omitBy(data, _.isEmpty);


      let finded = await CityModel.findById(id + '').exec();
      if (_.isEmpty(finded)) {
        return {
          ok: false,
          message: 'شهر مورد نظر یافت نشد',
        };
      }

      let result = await CityModel.findByIdAndUpdate(id + '', data, {
        new: true,
      }).exec();
      result = _.omit(result.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        city: result,
      });
    },
    async removeCity(ctx) {
      this.logger.info(`${this.name}-${this.version} removeCity`);

      const { id } = ctx.params;

      const result = await CityModel.deleteById(id).exec();

      return this.Promise.resolve({
        ok: !_.isNil(result),
      });
    },
    async list(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);

      const users = await UserModel.find({});
      return this.Promise.resolve({
        ok: true,
        users,
        count: users.length,
      });
    },
    async get(ctx) {
      this.logger.info(`${this.name}-${this.version} Get`);

      const { id, mobile } = ctx.params;

      let userFinded;
      if (mobile) {
        userFinded = await UserModel.findOne({ mobile }).exec();
      } else {
        userFinded = await UserModel.findById(id).exec();
      }

      if (_.isNil(userFinded)) {
        return {
          ok: false,
          status: 404,
          message: 'کاربر مورد نظر یافت نشد',
        };
      }

      const user = _.omit(userFinded.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        user,
      });
    },
    async count(ctx) {
      this.logger.info(`${this.name}-${this.version} Count`);

      let count = await UserModel.count({}).exec();

      return this.Promise.resolve({
        ok: true,
        count,
      });
    },
    async getCities(ctx) {
      this.logger.info(`${this.name}-${this.version} Count`);

      const { id } = ctx.params;


      let cities = await CityModel.find({
        state: id
      }).exec();

      return this.Promise.resolve({
        ok: true,
        cities,
      });
    },
    async getStates(ctx) {
      this.logger.info(`${this.name}-${this.version} Count`);

      let states = await StateModel.find({}).exec();

      return this.Promise.resolve({
        ok: true,
        states,
      });
    },
    async update(ctx) {
      this.logger.info(`${this.name}-${this.version} Update`);

      const { id } = ctx.params;

      let data = {
        ...ctx.params,
        id: null,
        mobile: null,
      };
      
      if(data.city == ""){
        data.city  = null;
      }

      if(data.state == ""){
        data.state  = null;
      }

      data = _.omitBy(data, _.isNil);


      let userFinded = await UserModel.findById(id + '').exec();
      if (_.isEmpty(userFinded)) {
        return {
          ok: false,
          message: 'کاربر مورد نظر یافت نشد',
        };
      }

      let result = await UserModel.findByIdAndUpdate(id + '', data, {
        new: true,
      }).exec();
      result = _.omit(result.toObject(), ['__v', '_id']);

      return this.Promise.resolve({
        ok: true,
        user: result,
      });
    },
    async remove(ctx) {
      this.logger.info(`${this.name}-${this.version} Remove`);

      const { id } = ctx.params;

      const result = await UserModel.deleteById(id).exec();

      return this.Promise.resolve({
        ok: !_.isNil(result),
      });
    },
    async statistics(ctx) {
      this.logger.info(`${this.name}-${this.version} Statistics`);

      const count = await UserModel.count({}).exec();

      return this.Promise.resolve({
        count: count ? count : 0,
      });
    },
  },

  /**
       * Events
       */
  events: {},

  /**
       * Methods
       */
  methods: {
    escapeRegex(text) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },
  },

  /**
       * Service created lifecycle event handler
       */
  async created() {
    this.logger.info(`${this.name}-${this.version} Service created.`);

    if (await StateModel.count({}).exec() <= 0) {
      statesData.states.map(async (state, i) => {

        const check = await StateModel.findOne({
          name: state.name
        });

        if (_.isEmpty(check)) {
          let data = {
            name: state.name
          };


          let newState = new StateModel(data);
          await newState.save();

          const stateId = newState.id;

          _.forEach(state.cities, async (city) => {
            let data = {
              name: city.name,
              state: stateId
            };

            const newState = new CityModel(data);
            await newState.save();
          });
        }
      });
    }
  },

  /**
       * Service started lifecycle event handler
       */
  started() {
    this.logger.info(`${this.name}-${this.version} Service started.`);
  },

  /**
       * Service stopped lifecycle event handler
       */
  stopped() {
    this.logger.info(`${this.name}-${this.version} Service stopped.`);
  },
};
