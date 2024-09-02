const { Model } = require("objection");
const User = require("./user");

class Cable extends Model {
    static get tableName() {
        return 'cable'
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [ 'userId', 'smart_card_number','merchant_ref', 'code', 'provider' ],
            properties: {
                id: { type: 'integer' },
                userId: { type: 'integer' },
                amount: { type: 'number' },
                provider: { type: 'string' },
                smart_card_number: { type: 'string' },
                phone_number: { type: 'string' },
                code: { type: 'string' },
                merchant_ref: { type: 'string' },
                reference: { type: 'string' },
                trx_id:  { type: 'string' },
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
                    from: 'cable.userId',
                    to: 'users.id'
                }
            }
        };
    }
}

module.exports = Cable;