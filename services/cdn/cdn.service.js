"use strict";

let express = require("express");
let morgan = require("morgan");
let bodyParser = require("body-parser");
let _ = require("lodash");
let cors = require("cors");
let multer = require("multer");
let randomString = require("randomstring");
let fs = require('fs');
const {
    cdn
} = require('../../config');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads')
    },
    filename: function (req, file, cb) {
        cb(null, "I" + randomString.generate({
            length: 16,
            charset: "0123456789"
        }))
    }
});
let upload = multer({ storage: storage });

module.exports = {
    name: "cdn",
    version: "1.0.0",

    /**
     * Service settings
     */
    settings: {
        port: process.env.PORT || 4111
    },

    /**
     * Service metadata
     */
    metadata: {},

    /**
     * Service dependencies
     */
    // dependencies: [
    //
    // ],

    /**
     * Actions
     */
    actions: {},

    /**
     * Events
     */
    events: {},

    /**
     * Methods
     */
    methods: {
        initRoutes: function (app) {
            app.use(cors());
            app.use(this.addBroker);
            app.use(this.tokenCheck);
            //app.use(this.firewallCheck);

            app.post("/image", upload.single("file"), function (
                req,
                res,
                next
            ) {
                res.send({
                    id: req.file.filename,
                    url: cdn + '/image/' + req.file.filename
                });
            });

            app.get("/image/:id", function (req, res, next) {
                fs.readFile("uploads/" + req.params.id, function (err, content) {
                    if (err) {
                        res.writeHead(400, { "Content-type": "text/html" });
                        res.end("No such image");
                    } else {
                        res.writeHead(200, { "Content-type": "image/jpg" });
                        res.end(content);
                    }
                });
            });

        },
        async addBroker(req, res, next) {
            req.broker = await this.broker;
            next();
        },
        async tokenCheck(req, res, next) {
            if (req.get("authorization") && req.get("authorization").includes("Bearer")) {
                const parts = req.get("authorization").split(' ');

                const result = await this.broker.call("1.0.0.account.check", {
                    token: parts[1]
                });

                if (result.ok) {
                    req.user = result.user;
                }
            }
            next();
        },
        async firewallCheck(req, res, next) {

            let data = {};
            _.set(data, 'request', req.originalUrl);
            _.set(data, 'host', req.get('host'));
            _.set(data, 'userAgent', req.get('user-agent'));
            _.set(data, 'ip', req.ip);
            _.set(data, 'origin', req.get('origin') || "");
            _.set(data, 'user', req.user || "");

            let callback = await this.broker.call("1.0.0.firewall.check", data, {
                timeout: 30000,
                retries: 3,
            });

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
    },

    /**
     * Service created lifecycle event handler
     */
    created() {
        const app = express();

        app.set("etag", true);
        app.enable("trust proxy");

        // Init morgan
        let stream = require("stream");
        let lmStream = new stream.Stream();

        lmStream.writable = true;
        lmStream.write = data => this.logger.info(data);

        app.use(morgan("dev", {
            stream: lmStream
        }));

        app.use(bodyParser.json({ limit: '50mb' }));
        app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

        this.initRoutes(app);

        this.app = app;
    },

    /**
     * Service started lifecycle event handler
     */
    started() {
        this.server = this.app.listen(Number(this.settings.port), err => {
            if (err)
                return this.broker.fatal(err);

            this.logger.info(`api server started on port ${this.settings.port}`);
        });
    },

    /**
     * Service stopped lifecycle event handler
     */
    stopped() {
        this.server.close(err => {
            if (err)
                return this.logger.error("api server close error!", err);

            this.logger.info("api server stopped!");
        });
    }
};