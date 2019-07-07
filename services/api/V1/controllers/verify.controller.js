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
        this.app.post(this.apiVersion + "verify/check", this.check.bind(this));
    }

    async check(req, res) {
        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.verify.check", data);
            res.send(callResult);
        } catch (error) {
            console.log(error);
            res.send({
                ok: false
            });
        }
    }

}

module.exports = UserController;