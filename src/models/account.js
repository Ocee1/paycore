// account.model.js
import { Model } from 'objection';
import User from './user.model';

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
        bank_code: { type: 'string' },
        account_number: { type: 'string' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
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