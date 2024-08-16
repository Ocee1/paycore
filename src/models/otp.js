const { Model } = require('objection');
const User = require('./user');

class Otp extends Model{
  static get tableName() {
    return 'otps';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'otp', 'expiresAt'],
      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        otp: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'otps.userId',
          to: 'users.id'
        }
      }
    };
  }
}

module.exports = Otp;