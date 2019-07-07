const _ = require('lodash');

class AccountController {
  constructor(app, broker, apiVersion) {
    this.name = 'businesses';
    this.version = '1.0.0';
    this.app = app;
    this.broker = broker;
    this.apiVersion = apiVersion;
  }

  load() {
    this.app.get(this.apiVersion + "businesses/brands", this.brands.bind(this));
    this.app.get(this.apiVersion + "businesses/brands/:id", this.models.bind(this));

    this.app.get(
      this.apiVersion + 'businesses/view/:id',
      this.getById.bind(this)
    );
    this.app.get(
      this.apiVersion + 'businesses/owner',
      this.getByOwner.bind(this)
    );
    this.app.get(this.apiVersion + 'businesses', this.getAll.bind(this));
    this.app.post(this.apiVersion + 'businesses', this.create.bind(this));
    this.app.post(this.apiVersion + 'businesses/near', this.near.bind(this));
    this.app.post(
      this.apiVersion + 'businesses/getAll',
      this.getAll.bind(this)
    );
  }

  async brands(req, res) {
    try {
      const callResult = await this.broker.call("1.0.0.businesses.getBrands");
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data
      });
    }
  }

  async models(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      const callResult = await this.broker.call("1.0.0.businesses.getModels", data);
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data
      });
    }
  }


  async near(req, res) {
    if (!req.user) {
      return res.send({
        ok: false,
        message: 'شماره موبایل خود را تایید نکرده اید',
      });
    }

    let data = {
      ...req.body,
      birthDate: new Date(req.body.bday),
      user: req.user,
    };

    data = _.omitBy(data, _.isNil);

    try {
      const callResult = await this.broker.call(
        '1.0.0.businesses.getNear',
        data
      );
      return res.send(callResult);
    } catch (error) {
      if (error.errorType && error.errorType === 'ERROR_DUPLICATE_MOBILE') {
        return res.send({
          ok: false,
          message: 'این شماره موبایل قبلا استفاده شده است',
        });
      }

      return res.send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async create(req, res) {
    if (!req.user) {
      return res.send({
        ok: false,
        message: 'شماره موبایل خود را تایید نکرده اید',
      });
    }

    let data = {
      ...req.body,
      user: req.user,
    };
    data = _.omitBy(data, _.isNil);

    try {
      const callResult = await this.broker.call(
        '1.0.0.businesses.create',
        data
      );
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async getAll(req, res) {
    let data = {
      ...req.body,
      user: req.user,
    };
    data = _.omitBy(data, _.isNil);

    try {
      const callResult = await this.broker.call(
        '1.0.0.businesses.getAll',
        data
      );
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async getByOwner(req, res) {
    let data = {
      ...req.body,
      user: req.user,
    };
    data = _.omitBy(data, _.isNil);

    try {
      const callResult = await this.broker.call(
        '1.0.0.businesses.getByOwner',
        data
      );
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async getById(req, res) {
    let data = {
      ...req.body,
      kind: req.params.kind,
      id: req.params.id,
      user: req.user,
    };
    data = _.omitBy(data, _.isNil);

    try {
      const callResult = await this.broker.call(
        '1.0.0.businesses.getById',
        data
      );
      return res.send(callResult);
    } catch (error) {
      return res.send({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }
}

module.exports = AccountController;
