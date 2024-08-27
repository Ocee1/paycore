/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('otps', function (table) {
        table.timestamp('expiresAt', { precision: 6 }).alter();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('otps', function (table) {
        table.timestamp('expiresAt').alter();
    })
};
