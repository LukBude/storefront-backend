import { Order } from './order';
import database from '../database';
import { OrderProduct } from './order-product';

export class OrderStore {
  async getActiveOrder(userId: string): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM orders WHERE user_id = ($1) AND status = ($2)';
      const result = await conn.query(sql, [userId, 'active']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot get active order: ${err}`);
    }
  }

  async getCompletedOrders(userId: string): Promise<Order[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM orders WHERE user_id = ($1) AND status = ($2)';
      const result = await conn.query(sql, [userId, 'complete']);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Cannot get completed orders: ${err}`);
    }
  }

  async addOrder(order: Order): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO orders(user_id, status) VALUES($1, $2) RETURNING *';
      const result = await conn.query(sql, [order.user_id, order.status]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot add order: ${err}`);
    }
  }

  async addProduct(orderId: string, productId: string, quantity: string): Promise<OrderProduct> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO order_products(order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING *';
      const result = await conn.query(sql, [orderId, productId, quantity]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot add product to order: ${err}`);
    }
  }

  async closeOrder(orderId: string): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql = 'UPDATE orders SET status = ($2) WHERE id = ($1) RETURNING *';
      const result = await conn.query(sql, [orderId, 'complete']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new Error(`Cannot close order: ${err}`);
    }
  }
}