const _ = require('lodash');
const express = require('express')
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require('helmet')

const Service = require('../../../core/service');
const config = require('./config');
const utils = require('./utils');


class APIService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: 'api',
      version: '3.0.0',
      methods: {
        run: this.run,
        addBroker: this.addBroker,
        preRoutes: this.preRoutes,
        afterRoutes: this.afterRoutes,
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped,
    });
  }

  preRoutes() {
    this.app.use(this.addBroker.bind(this))
  }

  afterRoutes() {
    this.app.use((_, res) => {
      res.send({
        ok: false,
        message: 'درخواست شما مجاز نمی باشد'
      })
    })
  }


  run(err, routes) {
    let apiVersion = "/V" + this.version;

    if (err) {
      return this.logger.error("API Service init routes error!", err);
    }

    this.preRoutes()

    routes.forEach(route => {
      this.app.use(apiVersion, route)
    });

    this.afterRoutes()


    this.server = this.app
      .listen(config.port, (error) => {
        if (error) {
          console.error(error)
          return process.exit(1)
        } else {
          this.logger.info('API Service Listening on port: ' + config.port + '.');
        }
      })
  }

  async addBroker(req, res, next) {
    req.broker = this.broker;
    next();
  }

  serviceCreated() {
    this.logger.info('API V2.0.0 Service created.');
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

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
      extended: true
    }));

    app.use(cors());
    app.use("/", rateLimit(config.rateLimting));
    app.use(helmet())

    this.app = app;

    utils.walk('./services', this.run.bind(this))
  }


  serviceStarted() {
    this.logger.info('API Service V2.0.0 started.');
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