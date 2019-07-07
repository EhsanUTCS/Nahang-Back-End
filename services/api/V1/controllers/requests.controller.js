const _ = require("lodash");

class AccountController {
    constructor(app, broker, apiVersion) {
        this.name = "requests";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.post(this.apiVersion + "requests", this.create.bind(this));
        this.app.post(this.apiVersion + "requests/serves", this.getServes.bind(this));
        this.app.post(this.apiVersion + "requests/contractor", this.setContractor.bind(this));
        this.app.get(this.apiVersion + "requests/employer", this.getEmployer.bind(this));
        this.app.get(this.apiVersion + "requests/contractor", this.getContractor.bind(this));
    }

    async create(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.requests.create", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getServes(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.requests.getServes", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async setContractor(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.requests.setContractor", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getContractor(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.requests.getContractor", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async getEmployer(req, res) {
        
        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }

        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.requests.getContractor", data);
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