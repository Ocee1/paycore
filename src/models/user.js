const { Model } = require('objection');

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
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        transaction_pin: { type: 'string' },
        created_at: { type: 'datetime' },
        updated_at: { type: 'datetime' },
        deleted_at: { type: 'datetime', nullable: true }
      }
    };
  }
}

export default User;