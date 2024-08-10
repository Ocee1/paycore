import { Model } from 'objection';
import User from './user.model';

class Token extends Model {
  static get tableName() {
    return 'tokens';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'token'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer', references: 'users.id' },
        token: { type: 'string' },
        expiresAt: { type: 'datetime' },
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
          from: 'tokens.userId',
          to: 'users.id'
        }
      }
    };
  }
}

export default Token;