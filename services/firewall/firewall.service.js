"use strict";

let _ = require("lodash");
let demandModel = require("./demands.model");

module.exports = {
  name: "firewall",
  version: "1.0.0",

  /**
   * Service settings
   */
  settings: {
    localIps: [
      "127.0..0.1",
      "::1",
      "localhost"
    ]
  },

  /**
   * Service metadata
   */
  metadata: {},

  /**
   * Service dependencies
   */
  //dependencies: [],

  /**
   * Actions
   */
  actions: {
    check: {
      params: {
        host: {
          type: "string",
          optional: false
        },
        userAgent: {
          type: "string",
          optional: false
        },
        ip: {
          type: "string",
          optional: false
        },
        origin: {
          type: "string",
          optional: false
        },
        request: {
          type: "string",
          optional: false
        },
        user: [
          {
            type: "string",
            empty: true,
            optional: false
          },
          {
            type: "object",
            optional: false
          }
        ]
      },
      handler: async function(ctx) {
        let { host, origin, user, userAgent, request, ip } = ctx.params;

        let newDemand = new demandModel({
          host: host,
          ip: ip,
          origin: (!_.isEmpty(origin)) ? origin : "",
          userAgent: userAgent,
          request: request,
          userId: (user && !_.isEmpty(user) && !_.isEmpty(user.userId)) ? user.userId : ""
        });

        try {
          await newDemand.save();
          return {
            ok: true,
            permit: true
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
    },
    count: {
      handler: async function(ctx) {

        let count = await demandModel.find().distinct("ip").exec();

        try {
          return {
            ok: true,
            count: count.length
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
    },

    countMonth: {
      handler: async function(ctx) {

        var date = new Date();
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

        let count = await demandModel.aggregate([
          { $match: { createdAt: { $gte: firstDay, $lt: lastDay } } },
          { $project: { day: { $dayOfMonth: "$createdAt" } } },
          { $group: { _id: { day: "$day" }, count: { $sum: 1 } } }, { $sort: { _id: 1 } }
        ]);

        let counts = [];

        for (let i in count) {
          counts.push({
            x: count[i]._id.day,
            y: count[i].count
          });
        }

        let i = 1;
        while (i <= 30) {
          let result = _.find(counts, ["x", i]);

          if (!result) {
            counts.push({
              x: i,
              y: 0
            });
          }

          i++;
        }

        counts = _.orderBy(counts, ["x"], ["asc"]); // Use Lodash to sort array by 'name'


        try {
          return {
            ok: true,
            count: counts
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
    }
  },

  /**
   * Events
   */
  events: {}
  ,

  /**
   * Methods
   */
  methods: {}
  ,

  /**
   * Service created lifecycle event handler
   */
  created() {

  }
  ,

  /**
   * Service started lifecycle event handler
   */
  started() {

  }
  ,

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {

  }
}
;