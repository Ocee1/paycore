const { Model } = require('objection');
const Transaction = require('./transaction');

class Transfer extends Model {
  static get tableName() {
    return 'transfers';
  }

 

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['senderId', 'status', 'transactionType', 'amount'],
      properties: {
        id: { type: 'integer' }, // Changed to 'integer'
        transactionId: { type: 'integer' }, 
        status: { type: 'integer', enum: [ 0, 1, 2, 3] },
        amount: { type: 'string' },
        bank: { type: 'string' },
        bank_code: { type: 'string' },
        account_number: { type: 'string' },
        account_name: { type: 'string' },
        narration: { type: 'string' },
        payload_response: { type: 'object' }, 
        reference: { type: 'string' },
        transactionType: { type: 'string', enum: ['credit', 'debit'] },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
        deletedAt: { type: 'string', format: 'date-time' },
      }
    };
  }

  static get relationMappings() {
    return {
      transaction: {
        relation: Model.BelongsToOneRelation,
        modelClass: Transaction,
        join: {
          from: 'transfers.transactionId',
          to: 'transactions.id'
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

module.exports = Transfer;
