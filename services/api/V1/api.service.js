const _ = require('lodash');
const express = require('express')
const fs = require('fs')
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')

const Service = require('../../../core/service');
const {
  api
} = require('../../../config');

const CarsController = require("./controllers/cars.controller");
const AccountController = require("./controllers/account.controller");
const AdminController = require("./controllers/admin.controller");
const TransactionsController = require("./controllers/transactions.controller");
const BusinessesController = require("./controllers/businesses.controller");
const SpecialtiesController = require("./controllers/specialties.controller");
const RequestsController = require("./controllers/requests.controller");
const OrdersController = require("./controllers/orders.controller");
const UserController = require("./controllers/user.controller");

class APIService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'api',
      version: '1.0.0',
      // dependencies: [{name: "groups", version: "1.0.0"}],
      methods: {
        initRoutes: this.initRoutes,
        tokenCheck: this.tokenCheck,
        firewallCheck: this.firewallCheck
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  initRoutes(app) {
    let apiVersion = "/V" + this.version + "/";

    const CAccount = new AccountController(app, this.broker, apiVersion);
    CAccount.load();

    const CTransactions = new TransactionsController(app, this.broker, apiVersion);
    CTransactions.load();

    const CAdmin = new AdminController(app, this.broker, apiVersion);
    CAdmin.load();

    const CUser = new UserController(app, this.broker, apiVersion);
    CUser.load();

    const CBusinesses = new BusinessesController(app, this.broker, apiVersion);
    CBusinesses.load();

    const CRequests = new RequestsController(app, this.broker, apiVersion);
    CRequests.load();

    const COrders = new OrdersController(app, this.broker, apiVersion);
    COrders.load();

    const CCars = new CarsController(app, this.broker, apiVersion);
    CCars.load();

    const CSpecialties = new SpecialtiesController(app, this.broker, apiVersion);
    CSpecialties.load();
  }


  async tokenCheck(req, res, next) {
    if (req.get("authorization") && req.get("authorization").includes("Bearer")) {
      const parts = req.get("authorization").split(' ');

      if (!parts[1]) {
        return next();
      }

      const result = await this.broker.call("1.0.0.account.check", {
        token: parts[1]
      });

      if (result.ok) {
        req.user = result.user || {};
        req.user.token = parts[1];
      }

    }
    next();
  }

  async firewallCheck(req, res, next) {
    let data = {};
    _.set(data, 'request', req.originalUrl);
    _.set(data, 'host', req.get('host'));
    _.set(data, 'userAgent', req.get('user-agent'));
    _.set(data, 'ip', req.ip);
    _.set(data, 'origin', req.get('origin') || "");
    _.set(data, 'user', req.user || "");

    let callback = await this.broker.call("1.0.0.firewall.check", data);

    if (callback.ok && callback.permit) {
      next();
    } else if (callback.ok && !callback.permit) {
      res.status(403);
      res.send({
        ok: false
      });
    } else {
      res.send(callback);
    }
  }

  serviceCreated() {
    this.logger.info('API Service created.');
    const app = express();

    app.set("etag", true);
    app.enable("trust proxy");

    let stream = require("stream");
    let lmStream = new stream.Stream();

    lmStream.writable = true;
    lmStream.write = data => this.logger.info(data);

    app.use(morgan("dev", {
      stream: lmStream
    }));

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.use(this.tokenCheck.bind(this))
    app.use(this.firewallCheck.bind(this))

    app.use(cors({
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    }));
    app.use("/", rateLimit(api.rateLimting));
    app.use(helmet())


    this.initRoutes(app);

    app.use((req, res) => {
      res.send({
        ok: false,
        message: 'درخواست شما مجاز نمی باشد'
      })
    })

    this.app = app;
  }

  serviceStarted() {
    this.logger.info('API Service started.');

    const options = {
      key: fs.readFileSync(__dirname + '/server.key'),
      cert: fs.readFileSync(__dirname + '/server.crt')
    }

    this.server = this.app
      .listen(api.port, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          this.logger.info('API Service Listening on port: ' + api.port + '.');
        }
      })
  }

  serviceStopped() {
    this.logger.info('API Service going to stop.');

    this.server.close(err => {
      if (err)
        return this.logger.error("API Service close error!", err);

      this.logger.info("API Service stopped!");
    });
  }
}

module.exports = APIService;