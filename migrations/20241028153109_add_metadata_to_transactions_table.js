/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
    return knex.schema.table('transactions', (table) => {
        table.text('meta_data').nullable(); // or table.longtext('meta_data').nullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
    return knex.schema.table('transactions', (table) => {
        table.dropColumn('meta_data');
    });
};