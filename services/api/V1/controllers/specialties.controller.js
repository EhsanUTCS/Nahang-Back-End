const _ = require("lodash");

class AccountController {
    constructor(app, broker, apiVersion) {
        this.name = "specialties";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.get(this.apiVersion + "specialties/owner", this.getByOwner.bind(this));
        this.app.get(this.apiVersion + "specialties", this.getAll.bind(this));
        this.app.post(this.apiVersion + "specialties", this.create.bind(this));
    }

    async create(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.specialties.create", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getAll(req, res) {

        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.specialties.getAll", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getByOwner(req, res) {
        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.specialties.getByOwner", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

}

module.exports = AccountController;