const knex = require('knex');
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('accounts', function (table) {
        table.increments('id').primary(); // Primary key
        table.integer('userId').unsigned().notNullable(); // Foreign key
        table.decimal('balance', 14, 2).notNullable();
        table.string('bank').notNullable();
        table.string('account_number').notNullable();
        table.string('account_name');
        table.text('payload_response');
        table.timestamp('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.timestamp('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));


        table.timestamp('deleted_at', { precision: 6 }).nullable();

        // Foreign key constraint
        table.foreign('userId').references('id').inTable('users');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('accounts');
};
