/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.table('transfers', function (table) {
        table.string('payment_gateway_ref');
        table.string('trx_ref');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('transfers', function (table) {
        table.dropColumn('payment_gateway_ref');
        table.dropColumn('trx_ref');
    })
};
