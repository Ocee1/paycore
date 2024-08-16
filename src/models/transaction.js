const { Model } = require('objection');
const User = require('./user');

class Transaction extends Model {
  static get tableName() {
    return 'transactions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['senderId', 'status', 'transactionType', 'amount'],

      properties: {
        id: { type: 'integer' },
        senderId: { type: 'string' },
        status: { type: 'integer', enum: [ 0, 1, 2, 3] },
        amount: { type: 'string' },
        transactionType: { type: 'string', enum: ['credit', 'debit'] },
        narration: { type: ['string',] },
        balanceBefore: { type: ['string',] },
        balanceAfter: { type: ['string',] },
        deleted_at: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'transactions.senderId',
          to: 'users.id'
        }
      }
    };
  }

  $beforeInsert() {
    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }

  $beforeUpdate() {
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Transaction;
