const Redis = require('ioredis');
const config = require('../../../config');

const redis = new Redis(config.redis.port, config.redis.host);

async function getLastID() {
  let res = await redis.incr('servix:specialties:lastID')
  return res;
}

module.exports = {
  getLastID
}