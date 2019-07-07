const _ = require("lodash");

class TransactionsController {
    constructor(app, broker, apiVersion) {
        this.name = "transactions";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.post(this.apiVersion + "transactions/check", this.check.bind(this));
        this.app.get(this.apiVersion + "transactions", this.get.bind(this));
    }


    async check(req, res) {
        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.transactions.check", data);
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
        let data = {
            ...req.body,
            user: req.user,
            many: true,
            oldest: false
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.transactions.get", data);
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

module.exports = TransactionsController;