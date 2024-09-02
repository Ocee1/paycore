/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('cable', function (table) {
        table.increments('id').primary();
        table.integer('userId').notNullable();
        table.double('amount').notNullable();
        table.string('provider').notNullable();
        table.string('smart_card_number').notNullable();
        table.string('phone_number').notNullable();
        table.string('code').notNullable();
        table.string('merchant_ref').notNullable();
        table.string('reference').nullable();
        table.string('trx_id').nullable();
        table.integer('status').notNullable().defaultTo(0);
        table.timestamp('created_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.timestamp('updated_at', { precision: 6 }).defaultTo(knex.fn.now(6));
        table.timestamp('deleted_at', { precision: 6 }).nullable(6);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('cable');
};