const { Model } = require('objection');

class Webhook extends Model{
  static get tableName() {
    return 'webhooks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'otp', 'expiresAt'],
      properties: {
        id: { type: 'integer' },
        meta_data: { type: 'string' },
        expiresAt: { type: 'datetime' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
      }
    };
  }
};

export default Webhook;