const { Model } = require('objection');

class Webhook extends Model{
  static get tableName() {
    return 'webhooks';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['session_id', 'meta_data'],
      properties: {
        id: { type: 'integer' },
        session_id: { type: 'string' },
        meta_data: { type: 'string' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
      }
    };
  }
};

module.exports = Webhook;