const development = require("./development");
const production = require("./production");

let config = null;
if (process.env.NODE_ENV === "production") {
  config = production;
} else {
  config = development;
}

module.exports = config;
