"use strict";

const AdminModel = require("./models/admin.model");
const _ = require("lodash");
const argon2 = require("argon2");
const jwt = require ('jsonwebtoken');
const config = require ('../../config');

/**
 * verify service
 */
module.exports = {
  name: "admin",
  version: "1.0.0",

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
    async auth(ctx) {
      this.logger.info(`${this.name}-${this.version} Auth`);

      const { email, password } = ctx.params;

      const admin = await AdminModel.findOne({
        email
      });

      if (_.isNil(admin)) {
        return {
          ok: false,
          message: "ایمیل مورد نظر معتبر نمی باشد"
        };
      }



      if (await argon2.verify(admin.password, password)) {
        const token = await this.createToken({
          admin: true,
          adminID: admin.adminID,
          name: admin.name,
          avatar: admin.avatar
        });


        return {
          ok: true,
          token
        }
      }

      return {
        ok: false,
        message: "ایمیل و رمز عبور معتبر نمی باشند"
      }
    },
    async create(ctx) {
      this.logger.info(`${this.name}-${this.version} Create`);

      const { email } = ctx.params;

      const checkMobile = await AdminModel.findOne({
        email
      });

      if (!_.isEmpty(checkMobile)) {
        return {
          ok: false,
          message: "شماره موبایل قبلا استفاده شده است"
        };
      }

      let data = {
        ...ctx.params
      };

      data = _.omitBy(data, _.isNil);
      data = _.omitBy(data, _.isEmpty);

      const newAdmin = new AdminModel(data);
      await newAdmin.save();

      const cleanedNewAdmin = _.omit(newAdmin.toObject(), ["__v", "_id"]);
      this.broker.emit("admins.create", cleanedNewAdmin);

      return this.Promise.resolve({
        ok: true,
        admin: cleanedNewAdmin
      });
    },
    async search(ctx) {
      this.logger.info(`${this.name}-${this.version} Search`);

      const { query } = ctx.params;

      let resultAdmins = [];

      let admins = await AdminModel.find({
        name: new RegExp(this.escapeRegex(query), "gi")
      }).exec();

      if (!_.isNil(admins)) {
        for (const key in admins) {
          const element = admins[key];
          const result = _.omit(element.toObject(), ["__v", "_id"]);
          resultAdmins.push(result);
        }
      }

      admins = await AdminModel.find({
        mobile: new RegExp(this.escapeRegex(query), "gi")
      }).exec();

      if (!_.isNil(admins)) {
        for (const key in admins) {
          const element = admins[key];
          const result = _.omit(element.toObject(), ["__v", "_id"]);
          resultAdmins.push(result);
        }
      }

      admins = await AdminModel.find({
        nationalCode: new RegExp(this.escapeRegex(query), "gi")
      }).exec();

      if (!_.isNil(admins)) {
        for (const key in admins) {
          const element = admins[key];
          const result = _.omit(element.toObject(), ["__v", "_id"]);
          resultAdmins.push(result);
        }
      }

      admins = await AdminModel.find({
        nationalId: new RegExp(this.escapeRegex(query), "gi")
      }).exec();

      if (!_.isNil(admins)) {
        for (const key in admins) {
          const element = admins[key];
          const result = _.omit(element.toObject(), ["__v", "_id"]);
          resultAdmins.push(result);
        }
      }

      resultAdmins = _.uniqBy(resultAdmins, "id");

      return {
        ok: true,
        admins: resultAdmins
      };
    },
    async list(ctx) {
      this.logger.info(`${this.name}-${this.version} List`);

      const admins = await AdminModel.find({});
      return this.Promise.resolve({
        ok: true,
        admins,
        count: admins.length
      });
    },
    async get(ctx) {
      this.logger.info(`${this.name}-${this.version} Get`);

      const { id, mobile } = ctx.params;

      let adminFinded;
      if (mobile) {
        adminFinded = await AdminModel.findOne({ mobile }).exec();
      } else {
        adminFinded = await AdminModel.findById(id).exec();
      }

      if (_.isNil(adminFinded)) {
        return {
          ok: false,
          status: 404,
          message: "کاربر مورد نظر یافت نشد"
        };
      }

      const admin = _.omit(adminFinded.toObject(), ["__v", "_id"]);

      return this.Promise.resolve({
        ok: true,
        admin
      });
    },
    async update(ctx) {
      this.logger.info(`${this.name}-${this.version} Update`);

      const { id } = ctx.params;

      let data = {
        ...ctx.params,
        id: null,
        mobile: null
      };
      data = _.omitBy(data, _.isNil);


      let adminFinded = await AdminModel.findById(id + "").exec();
      if (_.isEmpty(adminFinded)) {
        return {
          ok: false,
          message: "کاربر مورد نظر یافت نشد"
        };
      }

      let result = await AdminModel.findByIdAndUpdate(id + "", data, {
        new: true
      }).exec();
      result = _.omit(result.toObject(), ["__v", "_id"]);

      return this.Promise.resolve({
        ok: true,
        admin: result
      });
    },
    async remove(ctx) {
      this.logger.info(`${this.name}-${this.version} Remove`);

      const { id } = ctx.params;

      const result = await AdminModel.deleteById(id).exec();

      return this.Promise.resolve({
        ok: !_.isNil(result)
      });
    },
    async statistics(ctx) {
      this.logger.info(`${this.name}-${this.version} Statistics`);

      const count = await AdminModel.count({}).exec();

      return this.Promise.resolve({
        count: count ? count : 0
      });
    }
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
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    },
    async checkToken(token) {
      let decoded;
      try {
        decoded = jwt.verify(token, config.jwt.secret);
      } catch (error) {
        return false;
      }

      return decoded;
    },
    async createToken(claim) {
      const token = await jwt.sign(claim, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn
      });

      return token;
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this.logger.info(`${this.name}-${this.version} Service created.`);
  },

  /**
   * Service started lifecycle event handler
   */
  async started() {
    this.logger.info(`${this.name}-${this.version} Service started.`);

    const check = await AdminModel.findOne({
      email: "admin@nahangapp.ir"
    });

    if (_.isEmpty(check)) {
      let data = {
        email: "admin@nahangapp.ir",
        password: await argon2.hash("nahangapp-admin"),
        name: "admin"
      };

      const newAdmin = new AdminModel(data);
      await newAdmin.save();
    }
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {
    this.logger.info(`${this.name}-${this.version} Service stopped.`);
  }
};
