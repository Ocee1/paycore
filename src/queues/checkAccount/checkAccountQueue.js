const { Queue } = require('bullmq');

const redisConnection = require('../../config/redisConfig');



const checkAccountQueue = new Queue('checkAccountQueue', { connection: redisConnection });

module.exports = { checkAccountQueue };