const express = require('express');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const helmet = require('helmet');
require('./cron/reversalJob');
require('./cron/txnJob');
const knex = require('./config/objection');
const { corsOptions, DATABASE_PASSWORD, DATABASE_USER, MONGO_URI, NODE_ENV, PORT } = require('./config/index');


function createApp(routes) {
    const app = express();
    const env = NODE_ENV || 'development';
    const port = PORT || 4000;

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
