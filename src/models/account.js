const { Model } = require('objection');
const User = require('./user');

class Account extends Model {
  static get tableName() {
    return 'accounts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'balance', 'bank', 'account_number'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        balance: { type: 'integer' },
        bank: { type: 'string' },
        account_number: { type: 'string' },
        account_name: {type: 'string'},
        payload_response: { type: 'object' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: 'string', format: 'date-time', nullable: true },
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'accounts.userId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Account;