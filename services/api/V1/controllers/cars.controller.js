const _ = require("lodash");

class AccountController {
    constructor(app, broker, apiVersion) {
        this.name = "cars";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.get(this.apiVersion + "cars", this.get.bind(this));
        this.app.post(this.apiVersion + "cars", this.create.bind(this));
        this.app.get(this.apiVersion + "cars/:id", this.get.bind(this));
        this.app.delete(this.apiVersion + "cars/:id", this.del.bind(this));
        this.app.get(this.apiVersion + "rentcars", this.getRent.bind(this));
        this.app.post(this.apiVersion + "rentcars", this.createRent.bind(this));
        this.app.post(this.apiVersion + "rentcars/getAll", this.getRent.bind(this));
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
            const callResult = await this.broker.call("1.0.0.cars.create", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async createRent(req, res) {

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
            const callResult = await this.broker.call("1.0.0.cars.createRent", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }



    async del(req, res) {

        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
            })
        }

        let data = {
            ...req.body,
            id: req.params.id,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.cars.remove", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async get(req, res) {

        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
            })
        }

        let data = {
            ...req.body,
            id: req.params.id,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.cars.get", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getRent(req, res) {

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
            const callResult = await this.broker.call("1.0.0.cars.getRent", data);
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