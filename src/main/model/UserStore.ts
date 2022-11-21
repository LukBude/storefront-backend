import { User } from './user';
import database from '../database';
import bcrypt from 'bcrypt';

export class UserStore {
  private pepper = process.env.BCRYPT_PASSWORD;
  private saltRounds = process.env.SALT_ROUNDS;

  async getAllUsers(): Promise<User[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM users';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get users: ${err}`);
    }
  }

  async getUser(userId: string): Promise<User> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM users WHERE id = ($1)';
      const result = await conn.query(sql, [userId]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not get user: ${err}`);
    }
  }

  async addUser(user: User): Promise<User> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO users(firstname, lastname, username, password) VALUES($1, $2, $3, $4) RETURNING *';
      const hash = bcrypt.hashSync(user.password + this.pepper, parseInt(this.saltRounds!, 10));
      const result = await conn.query(sql, [user.firstname, user.lastname, user.username, hash]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Could not add user: ${err}`);
    }
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM users WHERE username = ($1)';
      const result = await conn.query(sql, [username]);
      conn.release();
      if (result.rows.length) {
        const user: User = result.rows[0];
        if (bcrypt.compareSync(password + this.pepper, user.password)) {
          return user;
        }
      }
      return null;
    } catch (err) {
      throw new Error(`Could not authenticate user: ${err}`);
    }
  }

  async getRoles(user: User): Promise<string[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT role FROM roles WHERE user_id = ($1)';
      const result = await conn.query(sql, [user.id]);
      conn.release();
      let roles: string[] = [];
      result.rows.forEach(row => roles.push(row.role));
      return roles;
    } catch (err) {
      throw new Error(`Could not get roles: ${err}`);
    }
  }

  async addRoles(user: User, roles: string[]): Promise<string[]> {
    const addedRoles: string[] = [];
    for (let role of roles) {
      const addedRole = await this.addRole(user, role);
      addedRoles.push(addedRole);
    }
    return addedRoles;
  }

  private async addRole(user: User, role: string): Promise<string> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO roles(role, user_id) VALUES($1, $2) RETURNING role';
      const result = await conn.query(sql, [role, user.id]);
      conn.release();
      return result.rows[0].role;
    } catch (err) {
      throw new Error(`Could not add role: ${err}`);
    }
  }

}