import { Order } from './order';
import database from '../database';
import { ApiError } from '../error/ApiError';

export class OrderStore {
  async getOrder(orderId: string): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM orders WHERE orders.id = ($1)';
      const result = await conn.query(sql, [orderId]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new ApiError(`Cannot get order: ${err}`);
    }
  }

  async getActiveOrder(userId: string): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM orders WHERE user_id = ($1) AND status = ($2)';
      const result = await conn.query(sql, [userId, 'active']);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new ApiError(`Cannot get active order: ${err}`);
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
      throw new ApiError(`Cannot get completed orders: ${err}`);
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
      throw new ApiError(`Cannot add order: ${err}`);
    }
  }

  async addProduct(orderId: string, productId: string, quantity: string): Promise<{ product_id: number, quantity: number }> {
    try {
      const conn = await database.connect();
      const sql = 'INSERT INTO order_products(order_id, product_id, quantity) VALUES($1, $2, $3) RETURNING product_id, quantity';
      const result = await conn.query(sql, [orderId, productId, quantity]);
      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new ApiError(`Cannot add product to order: ${err}`);
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
      throw new ApiError(`Cannot close order: ${err}`);
    }
  }

  async getProductsOfOrder(orderId: string): Promise<{ product_id: number, quantity: number }[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT product_id, quantity FROM order_products op WHERE op.order_id = ($1)';
      const result = await conn.query(sql, [orderId]);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new ApiError(`Cannot get products of order: ${err}`);
    }
  }

  async removeOrder(id: string): Promise<Order> {
    try {
      const conn = await database.connect();
      const sql_1 = 'DELETE FROM order_products op WHERE op.order_id = ($1)';
      await conn.query(sql_1, [id]);

      const sql_2 = 'DELETE FROM orders WHERE id = ($1) RETURNING *';
      const result = await conn.query(sql_2, [id]);

      conn.release();
      return result.rows[0];
    } catch (err) {
      throw new ApiError(`Cannot remove order with id ${id}: ${err}`);
    }
  }
}