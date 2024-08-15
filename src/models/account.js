const { Model } = require('objection');
const User = require('./user.model');

class Account extends Model {
  static get tableName() {
    return 'accounts';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'balance', 'bank', 'bank_code, account_number'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer', references: 'users.id' },
        balance: { type: 'decimal' },
        bank: { type: 'string' },
        account_number: { type: 'string' },
        account_name: {type: 'string'},
        payload_response: { type: 'text' },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' },
        deleted_at: { type: 'datetime', nullable: true }
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

export default Account;