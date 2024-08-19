const { Model } = require("objection");

class Deposit extends Model {
    static get tableName() {
        return 'deposits';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: [],
            preperties: {
                id: { type: 'integer' },
                type: { type: 'string' },
                amount: { type: 'number' },
                session_id: { type: 'integer' },
                account_number: { type: 'string' },
                source: {
                    type: 'object',
                    required: ['account_number', 'first_name', 'last_name', 'narration', 'bank', 'bank_code', 'createdAt'],
                    properties: {
                        account_number: { type: 'string' },
                        first_name: { type: 'string' },
                        last_name: { type: 'string' },
                        narration: { type: 'string' },
                        bank: { type: 'string' },
                        bank_code: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' } 
                    }
                },
            }
        }
    }
}

module.exports = Deposit;