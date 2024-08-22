/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('transfers', function (table) {
        table.renameColumn('payload_response', 'meta_data');
        table.dropColumn('reference');
        table.dropColumn('transactionId');
        table.integer('status').alter();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('transfers', function (table) {
        table.renameColumn('meta_data', 'payload_response');
    })
};