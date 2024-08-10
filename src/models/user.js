import { Model } from 'objection';

class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        id: { type: 'integer' },
        email: { type: 'string', format: 'email' },
        password: { type: 'string' },
        transaction_pin: { type: 'string' },
        createdAt: { type: 'datetime' },
        updatedAt: { type: 'datetime' }
      }
    };
  }
}

export default User;