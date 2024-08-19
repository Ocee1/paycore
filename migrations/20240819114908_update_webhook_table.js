/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('webhooks', function (table) {
        table.renameColumn('session_id', 'type');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('webhooks', function (table) {
        table.renameColumn('type', 'session_id');
    })
};
