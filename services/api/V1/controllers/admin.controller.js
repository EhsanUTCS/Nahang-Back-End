const _ = require("lodash");

class AccountController {
  constructor(app, broker, apiVersion) {
    this.name = "admin";
    this.version = "1.0.0";
    this.app = app;
    this.broker = broker;
    this.apiVersion = apiVersion;
  }

  load() {
    this.app.get(this.apiVersion + "admin/dashboard", this.dashboard.bind(this));
    this.app.post(this.apiVersion + "admin/account/auth", this.auth.bind(this));
    
    this.app.get(this.apiVersion + "admin/users/:id", this.getUser.bind(this));
    this.app.get(this.apiVersion + "admin/users", this.usersList.bind(this));
    this.app.post(this.apiVersion + "admin/users", this.userCreate.bind(this));
    this.app.put(this.apiVersion + "admin/users/:id", this.updateUser.bind(this));
    this.app.delete(this.apiVersion + "admin/users/:id", this.deleteUser.bind(this));

    this.app.get(this.apiVersion + "admin/orders/kind/:kind", this.ordersList.bind(this));
    this.app.get(this.apiVersion + "admin/orders", this.ordersList.bind(this));
    this.app.get(this.apiVersion + "admin/orders/:id", this.getOrder.bind(this));
    this.app.put(this.apiVersion + "admin/orders/:id", this.updateOrder.bind(this));
    this.app.delete(this.apiVersion + "admin/orders/:id", this.deleteOrder.bind(this));

    this.app.get(this.apiVersion + "admin/businesses/:id", this.getBusiness.bind(this));
    this.app.get(this.apiVersion + "admin/businesses/kind/:kind", this.businessesList.bind(this));
    this.app.get(this.apiVersion + "admin/businesses", this.businessesList.bind(this));
    this.app.put(this.apiVersion + "admin/businesses/:id", this.updateBusiness.bind(this));
    this.app.delete(this.apiVersion + "admin/businesses/:id", this.deleteBusiness.bind(this));

    this.app.get(this.apiVersion + "admin/transactions/:id", this.getTransaction.bind(this));
    this.app.get(this.apiVersion + "admin/transactions/orderType/:orderType", this.transactionsList.bind(this));
    this.app.get(this.apiVersion + "admin/transactions", this.transactionsList.bind(this));
  
    this.app.get(this.apiVersion + "admin/states", this.statesList.bind(this));
    this.app.post(this.apiVersion + "admin/states", this.stateCreate.bind(this));
    this.app.get(this.apiVersion + "admin/states/:id", this.getState.bind(this));
    this.app.put(this.apiVersion + "admin/states/:id", this.updateState.bind(this));
    this.app.delete(this.apiVersion + "admin/states/:id", this.deleteState.bind(this));

    this.app.get(this.apiVersion + "admin/cities", this.citiesList.bind(this));
    this.app.post(this.apiVersion + "admin/cities", this.cityCreate.bind(this));
    this.app.get(this.apiVersion + "admin/cities/:id", this.getCity.bind(this));
    this.app.put(this.apiVersion + "admin/cities/:id", this.updateCity.bind(this));
    this.app.delete(this.apiVersion + "admin/cities/:id", this.deleteCity.bind(this));

    this.app.get(this.apiVersion + "admin/brands", this.brandsList.bind(this));
    this.app.post(this.apiVersion + "admin/brands", this.brandCreate.bind(this));
    this.app.get(this.apiVersion + "admin/brands/:id", this.getBrand.bind(this));
    this.app.put(this.apiVersion + "admin/brands/:id", this.updateBrand.bind(this));
    this.app.delete(this.apiVersion + "admin/brands/:id", this.deleteBrand.bind(this));

    this.app.get(this.apiVersion + "admin/models", this.modelsList.bind(this));
    this.app.post(this.apiVersion + "admin/models", this.modelCreate.bind(this));
    this.app.get(this.apiVersion + "admin/models/:id", this.getModel.bind(this));
    this.app.put(this.apiVersion + "admin/models/:id", this.updateModel.bind(this));
    this.app.delete(this.apiVersion + "admin/models/:id", this.deleteModel.bind(this));
  }

  async dashboard(req, res) {
    let data = {
      ...req.body,
      user: req.user
    };

    const businessCount = await this.broker.call("1.0.0.businesses.count", data);
    const userCount = await this.broker.call("1.0.0.users.count", data);
    const visitsMonth = await this.broker.call("1.0.0.firewall.countMonth");
    const visits = await this.broker.call("1.0.0.firewall.count", data);
    const orders = await this.broker.call("1.0.0.orders.count", data);
    const ordersMonth = await this.broker.call("1.0.0.orders.countMonth", data);

    return res.send({
      ok: true,
      userCount: userCount.count,
      businessCount: businessCount.count,
      visits: visits.count,
      visitsMonth: visitsMonth.count,
      orders: orders.count,
      ordersMonth: ordersMonth.count
    });
  }

  async auth(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.admin.auth", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }


  async brandsList(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.brandsList", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getBrand(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.getBrand", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async brandCreate(req, res) {
    let data = {
      ...req.body,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.createBrand", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateBrand(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.updateBrand", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteBrand(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.removeBrand", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }


  async modelsList(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.modelsList", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getModel(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.getModel", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async modelCreate(req, res) {
    let data = {
      ...req.body,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.createModel", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateModel(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.updateModel", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteModel(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.removeModel", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async statesList(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.statesList", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getState(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.getState", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async stateCreate(req, res) {
    let data = {
      ...req.body,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.createState", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateState(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.updateState", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteState(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.removeState", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }


  async citiesList(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.citiesList", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getCity(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.getCity", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async cityCreate(req, res) {
    let data = {
      ...req.body,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.createCity", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateCity(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.updateCity", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteCity(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.removeCity", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }


  async usersList(req, res) {
    let data = {
      ...req.body
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.list", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getUser(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.get", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async userCreate(req, res) {
    let data = {
      ...req.body,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.create", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateUser(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.update", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteUser(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.users.remove", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }


  async ordersList(req, res) {
    let data = {
      ...req.body,
      kind: req.params.kind,
    };

    try {
      return res.send(await this.broker.call("1.0.0.orders.list", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getOrder(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.orders.get", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateOrder(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.orders.update", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteOrder(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.orders.remove", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async businessesList(req, res) {
    let data = {
      ...req.body,
      kind: req.params.kind,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.list", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async getBusiness(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.get", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async updateBusiness(req, res) {
    let data = {
      ...req.body,
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.update", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async deleteBusiness(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.businesses.remove", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  async transactionsList(req, res) {
    let data = {
      ...req.body,
      orderType: req.params.orderType,
    };

    try {
      return res.send(await this.broker.call("1.0.0.transactions.list", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }

  
  async getTransaction(req, res) {
    let data = {
      id: req.params.id,
    };

    try {
      return res.send(await this.broker.call("1.0.0.transactions.get", data));
    } catch (e) {
      return res.send({
        ok: false,
        message: "مشکلی بوجود آمد"
      });
    }
  }
}

module.exports = AccountController;