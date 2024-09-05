/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.alterTable('otps', function (table) {
        table.timestamp('deletedAt', { precision: 6 }).nullable().defaultTo(null).alter();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.alterTable('otps', function (table) {
        table.timestamp('deletedAt').nullable().alter();
    })
};
