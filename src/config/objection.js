const Knex = require('knex');
const config = require('../../knexfile');
const { Model } = require('objection');


const knex = Knex(config.development);


Model.knex(knex);

module.exports = knex;