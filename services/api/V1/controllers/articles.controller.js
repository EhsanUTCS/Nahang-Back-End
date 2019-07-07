const _ = require("lodash");

class ArtoclesController {
    constructor(app, broker, apiVersion) {
        this.name = "articles";
        this.version = "1.0.0";
        this.app = app;
        this.broker = broker;
        this.apiVersion = apiVersion;
    }

    load() {
        this.app.get(this.apiVersion + "articles/limit/:limit/skip/:skip", this.get.bind(this));
        this.app.post(this.apiVersion + "articles", this.create.bind(this));
        this.app.get(this.apiVersion + "articles", this.get.bind(this));
        this.app.get(this.apiVersion + "articles/:id", this.get.bind(this));
        this.app.put(this.apiVersion + "articles/:id", this.update.bind(this));
        this.app.delete(this.apiVersion + "articles/:id", this.remove.bind(this));
    }

    async create(req, res) {
        let data = {
            ...req.body,
            user: req.user
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.articles.create", data);
            res.send(callResult);
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                message: 'مشکلی به وجود آمده است'
            });
        }
    }

    async get(req, res) {
        let data = {
            ...req.body,
            user: req.user,
            articleID: req.params.id,
            limit: req.params.limit ? Number(req.params.limit) : undefined,
            skip: req.params.skip ? Number(req.params.skip) : undefined,
            many: req.params.id? false:true
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.articles.get", data);
            return res.send(callResult);
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                message: 'مشکلی به وجود آمده است'
            });        
        }

    }

    async update(req, res) {
        let data = {
            ...req.body,
            user: req.user,
            articleID: req.params.id
        };
        data = _.omitBy(data, _.isNil);

        try {
            const callResult = await this.broker.call("1.0.0.articles.update", data);
            return res.send(callResult);
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                message: 'مشکلی به وجود آمده است'
            });    
        }

    }

    async remove(req, res) {
 
        let data = {
            ...req.body,
            user: req.user,
            articleID: req.params.id
        };
        data = _.omitBy(data, _.isNil);


        try {
            const callResult = await this.broker.call("1.0.0.articles.remove", data);
            return res.send(callResult);
        } catch (error) {
            console.log(error);
            return res.send({
                ok: false,
                message: 'مشکلی به وجود آمده است'
            });    
        }

    }
}

module.exports = ArtoclesController;