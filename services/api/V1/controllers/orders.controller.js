const _ = require ('lodash');

class AccountController {
  constructor (app, broker, apiVersion) {
    this.name = 'orders';
    this.version = '1.0.0';
    this.app = app;
    this.broker = broker;
    this.apiVersion = apiVersion;
  }

  load () {
    this.app.get (
      this.apiVersion + 'orders/contractor',
      this.getByContractor.bind (this)
    );
    this.app.post (
      this.apiVersion + 'orders/:id/status',
      this.setStatus.bind (this)
    );
    this.app.post (
      this.apiVersion + 'orders/:id/daily-pay',
      this.dailyPay.bind (this)
    );
    this.app.post (this.apiVersion + 'orders/:id/pay', this.pay.bind (this));
    this.app.get (this.apiVersion + 'orders/:id', this.get.bind (this));
    this.app.get (this.apiVersion + 'orders', this.getAll.bind (this));
    this.app.post (this.apiVersion + 'orders', this.create.bind (this));
  }

  async create (req, res) {
    if (!req.user) {
      return res.send ({
        ok: false,
        message: 'شماره موبایل خود را تایید نکرده اید',
      });
    }

    let data = {
      ...req.body,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call ('1.0.0.orders.create', data);
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async get (req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call ('1.0.0.orders.get', data);
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async setStatus (req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call (
        '1.0.0.orders.setStatus',
        data
      );
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async dailyPay (req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call ('1.0.0.orders.dailyPay', data);
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async pay (req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call ('1.0.0.orders.pay', data);
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async getAll (req, res) {
    let data = {
      ...req.body,
      user: req.user,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call ('1.0.0.orders.getAll', data);
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }

  async getByContractor (req, res) {
    if (!req.user || !req.user.id) {
      return res.send ({
        ok: false,
        message: 'مجاز نمی باشد',
      });
    }

    let data = {
      ...req.body,
      contractor: req.user.id,
    };
    data = _.omitBy (data, _.isNil);

    try {
      const callResult = await this.broker.call (
        '1.0.0.orders.getByContractor',
        data
      );
      return res.send (callResult);
    } catch (error) {
      return res.send ({
        ok: false,
        message: error.message,
        data: error.data,
      });
    }
  }
}

module.exports = AccountController;
