const Knex = require('knex');
const knexConfig = require('./knexfile');
const knex = Knex(knexConfig.development);

const Model = require('objection').Model; 

Model.knex(knex);