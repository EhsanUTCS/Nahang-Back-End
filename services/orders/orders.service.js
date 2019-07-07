const _ = require("lodash");
const Service = require("../../core/service");
const moment = require("moment-jalaali");
const notif = require("./notif");
const OrdersModel = require("./models/orders.model");
const ParkingOrdersModel = require("./models/parking.model");
const HomeOrdersModel = require("./models/home.model");
const RentOrdersModel = require("./models/rent.model");

class OrdersService extends Service {
  constructor(broker) {
    super(broker);

    this.parseServiceSchema({
      name: "orders",
      version: "1.0.0",
      actions: {
        create: {
          handler: this.create
        },
        pay: {
          handler: this.pay
        },
        dailyPay: {
          handler: this.dailyPay
        },
        getAll: {
          handler: this.getAll
        },
        update: {
          handler: this.update
        },
        remove: {
          handler: this.remove
        },
        get: {
          handler: this.get
        },
        list: {
          handler: this.list
        },
        count: {
          handler: this.count
        },
        countMonth: {
          handler: this.countMonth
        },
        setStatus: {
          handler: this.setStatus
        },
        getByContractor: {
          handler: this.getByContractor
        }
      },
      methods: {},
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped
    });
  }

  async create(ctx) {
    this.logger.info("Businesses Service - create Action called.");

    const {
      service,
      carId,
      business,
      numOfDay,
      contractor,
      kind,
      data,
      user
    } = ctx.params;

    if (process.env.NODE_ENV === "production") {
      if (contractor == user.id) {
        return {
          ok: false,
          code: 4424,
          message: "contractor can not be user"
        };
      }
    }


    let order;
    if (kind == "ParkingOrder") {
      const callResult = await this.broker.call(
        "1.0.0.businesses.decreaseParking",
        {
          id: business
        }
      );

      if (!callResult.ok) {
        return {
          ok: false,
          message: "پارکنیگ مورد نظر دارای ظرفیت کافی نمی باشد"
        };
      }

      order = new ParkingOrdersModel({
        ...ctx.params,
        car: carId,
        customer: user.id,
        survey: {
          contractor: {
            submitted: false
          },
          customer: {
            submitted: false
          }
        },
        contractor,
        price: callResult.business.entrancePrice,
        remainingPrice: callResult.business.entrancePrice
      });
      await order.save();
    } else if (kind == "HomeOrder") {
      const callResult = await this.broker.call("1.0.0.businesses.get", {
        id: business
      });

      if (!callResult.ok || !callResult.business.active) {
        return {
          ok: false
        };
      }

      order = new HomeOrdersModel({
        ...ctx.params,
        customer: user.id,
        survey: {
          contractor: {
            submitted: false
          },
          customer: {
            submitted: false
          }
        },
        price: callResult.business.dailyPrice * numOfDay,
        remainingPrice: callResult.business.dailyPrice * numOfDay
      });
      await order.save();
    } else if (kind == "RentOrder") {
      const callResult = await this.broker.call("1.0.0.businesses.get", {
        id: business
      });

      if (!callResult.ok || !callResult.business.active) {
        return {
          ok: false
        };
      }

      order = new RentOrdersModel({
        ...ctx.params,
        customer: user.id,
        survey: {
          contractor: {
            submitted: false
          },
          customer: {
            submitted: false
          }
        },
        price: callResult.business.dailyPrice * numOfDay,
        remainingPrice: callResult.business.dailyPrice * numOfDay
      });
      await order.save();
    }

    // if (kind == 'cleaning') {
    //   const date = moment (
    //     `${moment ().jYear ()}/${data.month}/${data.day}`,
    //     'jYYYY/jM/jD'
    //   ).toDate ();
    //   if (date < new Date ()) {
    //     return {
    //       ok: false,
    //       message: 'date is not valid',
    //       code: 224242,
    //     };
    //   }
    // }

    // if (kind == 'cleaning') {
    //   let callback = await this.broker.call ('1.0.0.specialties.getAll');

    //   if (callback.total <= 0) {
    //     order.status = 'notFound';
    //   } else {
    //     let i = 0;
    //     while (
    //       i < callback.total &&
    //       callback.specialties[i].owner + '' === order.who + ''
    //     ) {
    //       i++;
    //     }

    //     if (i >= callback.total) {
    //       order.status = 'notFound';
    //     } else {
    //       order.contractor = callback.specialties[i].owner;
    //     }
    //   }
    //   await order.save ();
    // }

    notif.trigger(contractor + "", "new-order", {
      order: order.toObject(),
      kind,
      user
    });

    return {
      ok: true,
      order: order.toObject()
    };
  }

  async getAll(ctx) {
    this.logger.info("Businesses Service - getAll Action called.");

    const { user } = ctx.params;

    var orders = await OrdersModel.find(
      {
        customer: user.id
      },
      {},
      {
        sort: {
          updatedAt: -1
        }
      }
    )
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    return {
      ok: true,
      total: orders.length,
      orders: orders
    };
  }

  async list(ctx) {
    this.logger.info("Businesses Service - getAll Action called.");

    const { kind } = ctx.params;

    let data = {
      kind,
    };

    data = _.omitBy(data, _.isNil);
    data = _.omitBy(data, _.isEmpty);

    var orders = await OrdersModel.find(data)
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    return {
      ok: true,
      total: orders.length,
      orders: orders
    };
  }

  async getByContractor(ctx) {
    this.logger.info("Businesses Service - getByContractor Action called.");

    const { contractor } = ctx.params;

    var orders = await OrdersModel.find(
      {
        contractor: contractor
      },
      {},
      {
        sort: {
          updatedAt: -1
        }
      }
    )
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    return {
      ok: true,
      total: orders.length,
      orders: orders
    };
  }

  async get(ctx) {
    this.logger.info("Businesses Service - get Action called.");

    const { id } = ctx.params;

    const order = await OrdersModel.findById(id)
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    if (_.isNil(order)) {
      return {
        ok: false
      };
    }

    return {
      ok: true,
      order: order.toObject()
    };
  }

  async update(ctx) {
    this.logger.info (`${this.name}-${this.version} update`);

    const {id} = ctx.params;

    let data = {
      ...ctx.params,
      id: null,
    };
    data = _.omitBy (data, _.isNil);


    let orderFinded = await OrdersModel.findById (id + '').exec ();
    if (_.isEmpty (orderFinded)) {
      return {
        ok: false,
        message: 'کاربر مورد نظر یافت نشد',
      };
    }

    let result = await OrdersModel.findByIdAndUpdate (id + '', data, {
      new: true,
    }).exec ();
    result = _.omit (result.toObject (), ['__v', '_id']);

    return this.Promise.resolve ({
      ok: true,
      order: result,
    });
  }

  async remove (ctx) {
    this.logger.info (`${this.name}-${this.version} Remove`);

    const {id} = ctx.params;

    const result = await OrdersModel.deleteById (id).exec ();

    return this.Promise.resolve ({
      ok: !_.isNil (result),
    });
  }


  async setStatus(ctx) {
    this.logger.info("Businesses Service - get Action called.");

    const { id, status, data, user } = ctx.params;

    const order = await OrdersModel.findById(id)
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    if (order.status == status) {
      return {
        ok: true
      };
    }

    if (status == "survey") {
      if (order.contractor.id == user.id) {
        order.survey.contractor.items = data.surveyItems;
        order.survey.contractor.rate = data.rate;
        order.survey.contractor.submitted = true;

        await order.save();

        return {
          ok: true,
          order
        };
      } else if (order.customer.id == user.id) {
        order.survey.customer.items = data.surveyItems;
        order.survey.customer.rate = data.rate;
        order.survey.customer.submitted = true;

        await order.save();

        return {
          ok: true,
          order
        };
      } else {
        return {
          ok: false
        };
      }
    }

    if (status == "finish" && !order.checkout) {
      return {
        ok: false,
        message: "پرداخت انجام نشده است"
      };
    }

    if (!order.endDate && (status == "finish" || status == "checkout")) {
      order.endDate = moment().format("jYYYY/jM/jD HH:mm");
    }

    if (status == "doing") {
      order.startDate = moment().format("jYYYY/jM/jD HH:mm");
    }

    if (order.kind == "ParkingOrder") {
      if (status == "checkout") {
        let start = moment(order.startDate, "jYYYY/jM/jD HH:mm");
        let end = moment(order.endDate, "jYYYY/jM/jD HH:mm");

        let diff = end.diff(start, "seconds");
        const ddiff = diff;
        diff /= 60 * 60;
        const h = Math.abs(Math.round(diff));
        let otherPrice = h * order.business.hourlyPrice;

        order.diff = ddiff;

        if (data.carWash) {
          order.carWash = true;
          otherPrice += order.business.carWashPrice;
        }

        if (data.fuel > 0 && order.business.fuel) {
          order.fuel = data.fuel;
          otherPrice += data.fuel * order.business.fuelPrice;
        }

        if (data.cleaning) {
          order.cleaning = data.cleaning;
          otherPrice += order.business.cleaningPrice;
        }

        order.price += otherPrice;
        order.remainingPrice += otherPrice;
      }

      if (status == "cancel" || status == "reject" || status == "end") {
        const callResult = await this.broker.call(
          "1.0.0.businesses.increaseParking",
          {
            id: order.business.id
          }
        );
      }

      order.status = status;
      await order.save();
    } else if (order.kind == "HomeOrder") {
      if (status == "doing") {
        await this.broker.call("1.0.0.businesses.deactive", {
          id: order.service
        });
      } else if (status == "finish") {
        await this.broker.call("1.0.0.businesses.active", {
          id: order.service
        });
      }

      if (status == "doing") {
        let price = 0;

        if (data.wedding) {
          price += order.business.weddingPrice * order.numOfDay;
          order.wedding = true;
        }

        if (data.filming) {
          price += order.business.filmingPrice * order.numOfDay;
          order.filming = true;
        }

        if (data.birthday) {
          price += order.business.birthdayPrice * order.numOfDay;
          order.birthday = true;
        }

        order.price += price;
        order.remainingPrice += price;
      }

      if (status == "checkout" && order.checkout) {
        order.status = "finish";
      } else {
        order.status = status;
      }


      await order.save();
    } else if (order.kind == "RentOrder") {
      if (status == "doing") {
        let price = 0;
        if (data.wedding) {
          price += order.business.weddingPrice * order.numOfDay;
          order.wedding = true;
        }

        if (data.filming) {
          price += order.business.filmingPrice * order.numOfDay;
          order.filming = true;
        }

        if (data.suburban) {
          price += order.business.suburbanPrice * order.numOfDay;
          order.suburban = true;
        }

        order.price += price;
        order.remainingPrice += price;
      }

      if (status == "checkout" && order.checkout) {
        order.status = "finish";
      } else {
        order.status = status;
      }

      await order.save();
    }

    if (user.id == order.contractor.id && status != "survey") {
      notif.trigger(order.customer.id + "", "change-status", {
        kind: order.kind,
        order: order.toObject(),
        status
      });
    }

    if (user.id == order.customer.id && status != "survey") {
      notif.trigger(order.contractor.id + "", "change-status", {
        kind: order.kind,
        order: order.toObject(),
        status
      });
    }

    await order.save();
    return {
      ok: true,
      order
    };
  }

  async count(ctx) {
    this.logger.info(`${this.name}-${this.version} Count`);

    let count = await OrdersModel.count({}).exec();

    return this.Promise.resolve({
      ok: true,
      count
    });
  }

  async countMonth(ctx) {

    var date = new Date();
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    // let count = await OrdersModel.aggregate([
    //   { $match: { createdAt: { $gte: firstDay, $lt: lastDay } } },
    //   { $project: { day: { $dayOfMonth: "$createdAt" } } },
    //   { $group: { _id: { day: "$day" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }
    // ]);


    let count = await OrdersModel.aggregate([{
        '$match': {
          'createdAt': {
            '$gte': firstDay,
            '$lt': lastDay
          }
        }
      }, {
        '$project': {
          '_id': 0,
          'createdAt': 1,
          'price': 1
        }
      }, {
        '$group': {
          '_id': {
            'year': {
              '$year': '$createdAt'
            },
            'dayOfMonth': {
              '$dayOfMonth': '$createdAt'
            }
          },
          'count': {
            '$sum': 1
          },
          'sumPrice': {
            '$sum': '$price'
          }
        }
      }, {
        '$sort': {
          '_id.year': 1,
          '_id.dayOfMonth': 1
        }
      }
    ]);


    let data = _.range(30).map(function () { return 0 });
    let labels = _.range(1, 31);

    for (let i in count) {
      data[count[i]._id.dayOfMonth - 1] = count[i].count;
    }

    try {
      return {
        ok: true,
        count: {
          data,
          labels
        }
      };
    } catch (err) {
      return {
        ok: false,
        error: [
          err
        ]
      };
    }
  }

  async dailyPay(ctx) {
    this.logger.info("Order Service - dailyPay Action called.");

    const { id } = ctx.params;

    var order = await OrdersModel.findById(id)
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();

    const price = parseInt(
      order.price / order.numOfDay || order.remainingPrice || 0
    );

    if (order.remainingPrice < 1) {
      return {
        ok: true
      };
    }

    try {
      let res = await this.broker.call("1.0.0.wallet.transfer", {
        from: order.customer.id,
        to: order.contractor.id,
        details: {
          order
        },
        price
      });

      if (!res.ok) {
        return {
          ok: false
        };
      }

      await this.broker.call("1.0.0.users.update", {
        id: order.customer.id + "",
        score: (parseInt(order.customer.score) || 0) + parseInt(price / 1000)
      });

      order.remainingPrice -= price;

      if (order.remainingPrice == 0) {
        order.checkout = true;
      }

      await order.save();
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        data: error.data
      };
    }

    return {
      ok: true
    };
  }

  async pay(ctx) {
    this.logger.info("Order Service - pay Action called.");

    const { id } = ctx.params;

    var order = await OrdersModel.findById(id)
      .populate("car business customer contractor")
      .populate({
        path: "business",
        populate: {
          path: "owner"
        }
      })
      .exec();
    const price = parseInt(order.remainingPrice || 0);

    if (order.remainingPrice < 1) {
      return {
        ok: true
      };
    }

    try {
      let res = await this.broker.call("1.0.0.wallet.transfer", {
        from: order.customer.id,
        to: order.contractor.id,
        details: {
          order
        },
        price
      });

      if (!res.ok) {
        return {
          ok: false
        };
      }

      await this.broker.call("1.0.0.users.update", {
        id: order.customer.id + "",
        score: (parseInt(order.customer.score) || 0) + parseInt(price / 1000)
      });

      order.remainingPrice -= price;

      if (order.remainingPrice == 0) {
        order.checkout = true;
      }

      order.save();
    } catch (error) {
      return {
        ok: false,
        message: error.message,
        data: error.data
      };
    }

    return {
      ok: true
    };
  }

  serviceCreated() {
    this.logger.info("Orders Service created.");
  }

  serviceStarted() {
    this.logger.info("Orders Service started.");
  }

  serviceStopped() {
    this.logger.info("Orders Service stopped.");
  }
}

module.exports = OrdersService;
