const express = require('express');
const hpp = require('hpp');

const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
require('./cron/reversalJob');
// require('./cron/txnJob');
// require('./cron/dataRefundJob')
// require('./cron/electricityReversal');
// require('./cron/airtimeRefund');
// require('./cron/bettingRefund');
// require('./cron/cableRefund');
require('./queues/queueManager');
const knex = require('./config/objection');
const { corsOptions, NODE_ENV, PORT } = require('./config/index');
const { connectRedis } = require('./config/redisConfig');



function createApp(routes) {
    const app = express();
    const env = NODE_ENV || 'development';
    const port = PORT || 4000;

    connectRedis();
    initializeMiddlewares(app);
    initializeRoutes(app, routes);

    return {
        listen: () => {
            const server = app.listen(port, () => {
                console.log(`🚀 App listening on the port ${port}`);
                console.log(`================================`);
            });
        },
        getServer: () => app,
    };
}




function initializeMiddlewares(app) {
    app.use(cors());
    app.use(helmet());
    app.use(hpp());
    app.use(compression());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
}

function initializeRoutes(app, routes) {
    routes.forEach(route => {
        app.use('/api', route);
    });
}


module.exports = createApp;
