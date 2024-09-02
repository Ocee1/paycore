const { Model } = require("objection");
const User = require("./user");

class Airtime extends Model {
    static get tableName() {
        return 'airtime'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                amount: { type: 'number' },
                amount_charged: { type: 'number' },
                phone_number: { type: 'string' },
                network: { type: 'string' },
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
                    from: 'airtime.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = Airtime;