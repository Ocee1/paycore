const { Model } = require('objection');
const User = require('./user');
const moment = require('moment');

class Transaction extends Model {
  static get tableName() {
    return 'transactions';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['status', 'type', 'amount'],

      properties: {
        id: { type: 'integer' },
        userId: { type: 'integer' },
        status: { type: 'integer', enum: [ 0, 1, 2, 3, 11, 12] },
        amount: { type: 'number' },
        type: { type: 'string' },
        trx_ref: { type: 'string' },
        meta_data: { type: 'string' },
        payment_gateway_ref: { type: 'string' },
        bulk_transfer_id: { type: ['integer', 'null'] },
        fee: { type: 'number' },
        balanceBefore: { type: 'number'},
        balanceAfter: { type: 'number' },
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
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    this.createdAt = now;
    this.updatedAt = now;
  }

  $beforeUpdate() {
    this.updatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
  }
}

module.exports = Transaction;
