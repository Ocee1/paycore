const { Model } = require("objection");
const User = require("./user");

class Electricity extends Model {
    static get tableName() {
        return 'electricity'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [ 'userId' ],
            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                amount: { type: 'number' },
                provider: { type: 'string' },
                meter_number: { type: 'string' },
                meter_type: { type: 'string' },
                phone_number: { type: 'string' },
                customer_name: { type: 'string' },
                customer_address: { type: 'string' },
                merchant_ref: { type: 'string' },
                reference: { type: 'string' },
                meta_data: { type: 'string' },
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
                    from: 'electricity.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = Electricity;