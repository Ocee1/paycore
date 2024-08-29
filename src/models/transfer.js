const { Model } = require('objection');
const Transaction = require('./transaction');
const moment = require('moment');

class Transfer extends Model {
  static get tableName() {
    return 'transfers';
  }

 

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['userId', 'status', 'amount'],
      properties: {
        id: { type: 'integer' }, 
        userId: { type: 'integer' },
        status: { type: 'integer', enum: [ 0, 1, 2, 3, 11 ] },
        trx_ref: { type: 'integer' },
        payment_gateway_ref: { type: 'string' },
        session_id: { type: 'integer' },
        fee: { type: 'number' },
        amount: { type: 'number' },
        bank: { type: 'string' },
        bank_code: { type: 'string' },
        account_number: { type: 'string' },
        account_name: { type: 'string' },
        narration: { type: 'string' },
        meta_data: { type: 'object' },
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
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    this.createdAt = now;
    this.updatedAt = now;
  }

  $beforeUpdate() {
    this.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

module.exports = Transfer;
