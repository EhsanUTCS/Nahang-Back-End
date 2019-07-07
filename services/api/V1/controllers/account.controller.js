const _ = require("lodash");

class AccountController {
    constructor(app, broker, apiVersion) {
        this.name = "account";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.get(this.apiVersion + "account", this.me.bind(this));
        this.app.put(this.apiVersion + "account", this.updateMe.bind(this));

        this.app.post(this.apiVersion + "account/register", this.register.bind(this));
        this.app.post(this.apiVersion + "account/auth", this.auth.bind(this));
        this.app.post(this.apiVersion + "account/auth/check", this.checkAuth.bind(this));
        this.app.post(this.apiVersion + "account/auth/retry", this.checkAuth.bind(this));
        this.app.post(this.apiVersion + "account/check", this.check.bind(this));
        this.app.post(this.apiVersion + "account/logout", this.logout.bind(this));
        this.app.post(this.apiVersion + "account/wallet", this.walletAdd.bind(this));
    }

    async register(req, res) {

        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }


        let data = {
            ...req.body,
            birthDate: new Date(req.body.bday),
            user: req.user
        };

        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.account.register", data);
            return res.send(callResult);
        } catch (error) {
            if (error.errorType && error.errorType === 'ERROR_DUPLICATE_MOBILE') {
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

    async auth(req, res) {
        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.account.auth", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async checkAuth(req, res) {
        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.account.checkAuth", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async retry(req, res) {
        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.account.retry", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async check(req, res) {
        let data = {
            ...req.body
        };
        data = _.omitBy(data, _.isNil);

        if(_.isEmpty(data.token)){
            return res.send({
                ok: true,
                login: true
            });
        }

        try {
            const callResult = await this.broker.call("1.0.0.account.check", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }
    
    async logout(req, res) {

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
            const callResult = await this.broker.call("1.0.0.account.logout", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async walletAdd(req, res) {

        if (!req.user) {
            return res.send({
                ok: false,
                message: 'شماره موبایل خود را تایید نکرده اید'
             })
        }
        
        let data = {
            ...req.body,
            user: req.user,
            origin: req.user.id
        };

        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.wallet.increase", data);
            return res.send(callResult);
        } catch (error) {
            return res.send({
                ok: false,
                message: error.message,
                data: error.data
            });
        }
    }

    async me(req, res) {
        if (!req.user) {
            return {
                ok: false,
                message: 'لطفا وارد شوید'
            }
        }

        let data = {
            id: req.user.id,
            many: false
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

    async updateMe(req, res) {
        if (!req.user) {
            return {
                ok: false,
                message: 'لطفا وارد شوید'
            }
        }

        let data = {
            ...req.body,
            id: req.user.id,
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.users.update", data);
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