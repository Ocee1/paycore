const { Model } = require('objection');
const User = require('./user.model');

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
        expires_at: { type: 'datetime' },
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
          from: 'tokens.userId',
          to: 'users.id'
        }
      }
    };
  }
}

export default Token;