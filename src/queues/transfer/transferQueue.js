const { Queue } = require('bullmq');
const redisConnection = require('../../config/redisConfig');
// const { connection } = require('../queueManager');

const transferQueue = new Queue('transferQueue', { connection: redisConnection });

module.exports = { transferQueue };
