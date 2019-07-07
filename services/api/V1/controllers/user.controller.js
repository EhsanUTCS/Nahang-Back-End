const _ = require("lodash");

class UserController {
    constructor(app, broker, apiVersion) {
        this.name = "users";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.get(this.apiVersion + "users/states", this.states.bind(this));
        this.app.get(this.apiVersion + "users/states/:id", this.cities.bind(this));

        this.app.get(this.apiVersion + "users/count", this.count.bind(this));
        this.app.get(this.apiVersion + "users/limit/:limit/skip/:skip", this.get.bind(this));
        this.app.get(this.apiVersion + "users", this.get.bind(this));
        this.app.get(this.apiVersion + "users/search/:query", this.search.bind(this));
        this.app.get(this.apiVersion + "users/:id", this.get.bind(this));
        this.app.post(this.apiVersion + "users", this.create.bind(this));
        this.app.put(this.apiVersion + "users/:id", this.update.bind(this));
        this.app.delete(this.apiVersion + "users/:id", this.remove.bind(this));
    }

    async states(req, res) {
        try {
            const callResult = await this.broker.call("1.0.0.users.getStates");
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async cities(req, res) {
        let data = {
            id: req.params.id,
        };

        try {
            const callResult = await this.broker.call("1.0.0.users.getCities", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async create(req, res) {
        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.create", data);
            res.send(callResult);
        } catch (error) {
            if(error.errorType && error.errorType === 'ERROR_DUPLICATE_MOBILE'){
                return res.send({
                    ok: false,
                    message: 'این شماره موبایل قبلا استفاده شده است'
                });
            }

            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    
    async get(req, res) {
        let data = {
            user: req.user,
            id: req.params.id,
            limit: req.params.limit ? Number(req.params.limit) : undefined,
            skip: req.params.skip ? Number(req.params.skip) : undefined,
            many: req.params.id? false:true
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.get", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async count(_, res) {
        try {
            const callResult = await this.broker.call("1.0.0.users.count");
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async search(req, res) {
        let data = {
            ...req.body,
            user: req.user,
            query: req.params.query
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.search", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }

    }


    async update(req, res) {
        let data = {
            ...req.body,
            user: req.user,
            id: req.params.id
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.update", data);
            return res.send(callResult);
        } catch (error) {
            if(error.errorType && error.errorType === 'ERROR_DUPLICATE_MOBILE'){
                return res.send({
                    ok: false,
                    message: 'این شماره موبایل قبلا استفاده شده است'
                });
            }

            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }

    }

    async remove(req, res) {
 
        let data = {
            user: req.user,
            id: req.params.id
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.remove", data);
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

module.exports = UserController;