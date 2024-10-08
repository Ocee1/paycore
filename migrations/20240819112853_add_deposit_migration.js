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
        table.integer('userId').unsigned().notNullable();
        table.integer('status').notNullable().defaultTo(0);
        table.string('account_number').notNullable();
        table.json('source').notNullable();
        table.timestamp('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.timestamp('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.timestamp('deleted_at', { precision: 6 }).nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('deposits');
};
