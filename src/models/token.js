const { Model } = require('objection');
const User = require('./user');

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
        userId: { type: 'integer', },
        token: { type: 'string' },
        expires_at: { type: 'string', format: 'date-time' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
        deleted_at: { type: 'string', format: 'date-time', nullable: true},
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

module.exports = Token;