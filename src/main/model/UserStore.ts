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
      throw new Error(`Cannot get users: ${err}`);
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
      throw new Error(`Cannot get user: ${err}`);
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
      throw new Error(`Cannot add user: ${err}`);
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
      throw new Error(`Cannot authenticate user: ${err}`);
    }
  }

}