const Redis = require('ioredis');
const redisConnection = new Redis();

// Import and initialize workers
const { checkAccountWorker } = require('./checkAccount/checkAccountWorker');
const { transferWorker } = require('./transfer/transferWorker');

checkAccountWorker.on('completed', (job) => {
    console.log(`Check account job ${job.id} completed.`);
});

transferWorker.on('completed', (job) => {
    console.log(`Transfer job ${job.id} completed.`);
});

const redisConf = { connection: redisConnection }
module.exports = {
    redisConf
};
