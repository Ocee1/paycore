const { Model } = require('objection');

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
        status: { type: 'string', enum: ['pending', 'completed', 'failed', 'reversed'] },
        amount: { type: 'string' },
        transactionType: { type: 'string', enum: ['credit', 'debit'] },
        description: { type: ['string', 'null'] },
        balanceBefore: { type: ['string', 'null'] },
        balanceAfter: { type: ['string', 'null'] },
        deleted_at: { type: 'string', format: 'date-time' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
      },
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
