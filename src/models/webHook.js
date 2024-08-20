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
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      }
    };
  }
};

module.exports = Webhook;