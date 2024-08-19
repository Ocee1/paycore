const { Model } = require('objection');

class Webhook extends Model{
  static get tableName() {
    return 'webhooks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['type', 'meta_data'],
      properties: {
        id: { type: 'integer' },
        type: { type: 'string' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
      }
    };
  }
};

module.exports = Webhook;