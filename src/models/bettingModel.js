const { Model } = require("objection");
const User = require("./user");

class Betting extends Model {
    static get tableName() {
        return 'betting'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                amount: { type: 'number' },
                name: { type: 'string' },
                type: { type: 'string' },
                customer_id: { type: 'string' },
                merchant_ref: { type: 'string' },
                reference: { type: 'string' },
                status: { type: 'integer', enum: [ 0, 1, 2, 3, 11, 12 ] },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
                deleted_at: { type: 'string', format: 'date-time', nullable: true }
            }
        }
    }
    static get relationMappings() {
        return {
            user: {
                relation: Model.BelongsToOneRelation,
                modelClass: User,
                join: {
                    from: 'betting.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = Betting;