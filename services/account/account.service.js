const _ = require("lodash");
const Service = require("../../core/service");
const jwt = require("jsonwebtoken");
const config = require("../../config");

const AuthModel = require("./models/auth.model");

class AccountService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: "account",
      version: "1.0.0",
      meta: {},
      dependencies: [{ name: "users", version: "1.0.0" }],
      settings: {},
      actions: {
        register: {
          handler: this.register
        },
        auth: {
          handler: this.auth
        },
        retry: {
          handler: this.retry
        },
        checkAuth: {
          handler: this.checkAuth
        },
        check: {
          handler: this.check
        },
        logout: {
          handler: this.logout
        }
      },
      methods: {
        createToken: this.createToken,
        checkToken: this.checkToken
      },
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped
    });
  }

  async register(ctx) {
    const {
      name,
      city,
      state,
      sex,
      nationalCode,
      nationalId,
      birthDate,
      user
    } = ctx.params;

    if (_.isEmpty(user) && user.mobile) {
      return {
        ok: false,
        message: "شماره موبایل خود را تایید نکرده اید"
      };
    }

    const data = {
      name,
      city,
      state,
      sex,
      nationalCode,
      nationalId,
      birthDate,
      register: false,
      id: user.id
    };

    const callResult = await this.broker.call("1.0.0.users.update", data);

    let auth = new AuthModel({
      mobile: user.mobile,
      user: callResult.user.id
    });
    await auth.save();

    const token = await this.createToken({
      mobile: auth.mobile,
      uuid: auth.uuid,
      userID: callResult.user.userID,
      register: callResult.user.register
    });

    auth.token = token;
    await auth.save();

    return {
      ...callResult,
      token
    };
  }

  async auth(ctx) {
    this.logger.info("Account Service - auth Action called.");

    let { mobile } = ctx.params;

    if (_.isEmpty(mobile)) {
      return {
        ok: false
      };
    }

    let callback = await this.broker.call("1.0.0.verify.create", {
      type: "mobile",
      recipent: mobile
    });

    return callback;
  }

  async retry(ctx) {
    this.logger.info("Account Service - retry Action called.");

    let { mobile } = ctx.params;

    if (_.isEmpty(mobile)) {
      return {
        ok: false
      };
    }

    let callback = await this.broker.call("1.0.0.verify.create", {
      type: "mobile",
      recipent: mobile
    });

    return callback;
  }

  async logout(ctx) {
    this.logger.info("Account Service - logout Action called.");

    let { user } = ctx.params;

    if (_.isEmpty(user.token)) {
      return {
        ok: true
      };
    }

    let decoded = await this.checkToken(user.token);

    if (!decoded) {
      return {
        ok: true
      };
    }

    let auth = await AuthModel.findOne({
      uuid: decoded.uuid
    });

    if (auth) {
      auth.deactive = true;
      await auth.save();
    }

    return {
      ok: true
    };
  }

  async checkAuth(ctx) {
    this.logger.info("Account Service - checkAuth Action called.");
    const { hash, code } = ctx.params;

    let callback = await this.broker.call("1.0.0.verify.check", {
      hash,
      code
    });

    if (!callback.ok) {
      return callback;
    }

    let data = {
      mobile: callback.verify.for
    };
    data = _.omitBy(data, _.isNil);

    let userFinded = await this.broker.call("1.0.0.users.get", {
      mobile: callback.verify.for
    });

    if (userFinded.ok) {
      _.set(data, "user", userFinded.user.id);
    } else if (userFinded.status == 404) {
      userFinded = await this.broker.call("1.0.0.users.create", {
        mobile: callback.verify.for
      });
      _.set(data, "user", userFinded.user.id);
    } else {
      return callback;
    }

    let auth = new AuthModel(data);
    await auth.save();

    const token = await this.createToken({
      mobile: auth.mobile,
      uuid: auth.uuid,
      userID: userFinded.user.userID,
      register: userFinded.user.register
    });

    auth.token = token;
    await auth.save();

    return {
      ok: true,
      token,
      register: userFinded.user.register
    };
  }

  async check(ctx) {
    // this.logger.info('Account Service - check Action called.');

    const { token } = ctx.params;

    if (!token) {
      return {
        ok: true,
        login: true,
        token: "توکن شما نا معتبر می باشد"
      };
    }

    let decoded = await this.checkToken(token);

    if (decoded.admin) {
      return {
        ok: true,
        user: decoded
      };
    }

    if (!decoded || !decoded.uuid) {
      return {
        ok: true,
        login: true,
        token: "توکن شما نا معتبر می باشد"
      };
    }

    let auth = await AuthModel.findOne({
      uuid: decoded.uuid,
      deactive: false
    });

    if (!auth || _.isNil(auth)) {
      return {
        ok: true,
        login: true
      };
    }

    if (_.isNil(auth.user)) {
      return {
        ok: true,
        register: true,
        user: {
          mobile: auth.mobile,
          register: true
        }
      };
    }

    const { user } = await ctx.call("1.0.0.users.get", {
      mobile: auth.mobile
    });

    if (user) {
      return {
        ok: true,
        user
      };
    }

    return {
      ok: true,
      login: true
    };
  }

  async checkToken(token) {
    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (error) {
      return false;
    }

    return decoded;
  }

  async createToken(claim) {
    const token = await jwt.sign(claim, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });

    return token;
  }

  serviceCreated() {
    this.logger.info("Account Service created.");
  }

  serviceStarted() {
    this.logger.info("Account Service started.");
  }

  serviceStopped() {
    this.logger.info("Account Service stopped.");
  }
}

module.exports = AccountService;
