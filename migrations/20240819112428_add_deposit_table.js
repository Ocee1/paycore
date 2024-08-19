/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('deposits', function (table) {
        table.increments('id').primary();
        table.string('type').notNullable();
        table.double('amount').notNullable();
        table.string('session_id').notNullable();
        table.string('account_number').notNullable();
        table.json('source').notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('deposits');
};
