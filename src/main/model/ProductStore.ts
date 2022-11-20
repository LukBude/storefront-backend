import { Product } from './product';
import database from '../database';

export class ProductStore {
  async getAllProducts(): Promise<Product[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM products';
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Cannot get products: ${err}`);
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM products WHERE id = ($1)';
      const result = await conn.query(sql, [id]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot get product with id ${id}: ${err}`);
    }
  }

  async addProduct(product: Product): Promise<Product> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO products(name, price, category) VALUES($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [product.name, product.price, product.category]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot add product: ${err}`);
    }
  }
}