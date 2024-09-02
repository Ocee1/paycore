/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('airtime', function (table) {
        table.increments('id').primary();
        table.integer('userId').notNullable();
        table.double('amount').notNullable();
        table.string('phone_number').notNullable();
        table.string('network').notNullable();
        table.string('merchant_ref').notNullable();
        table.string('reference').notNullable();
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
    return knex.schema.dropTable('airtime');
};




