const { Model } = require('objection');

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
        userId: { type: 'integer', references: 'users.id' },
        otp: { type: 'string' },
        expiresAt: { type: 'datetime' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
      }
    };
  }
}

export default Otp;