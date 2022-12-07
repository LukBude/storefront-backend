import { Product } from '../model/product';
import database from '../database';

class DashboardService {
  async getMostPopularProducts(): Promise<Product[]> {
    try {
      const conn = await database.connect();
      const sql = `SELECT *
                   FROM products
                   WHERE id IN
                         (SELECT product_id
                          FROM order_products
                          GROUP BY product_id
                          ORDER BY SUM(quantity) DESC
                          LIMIT 3)`;
      const result = await conn.query(sql);
      conn.release();
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get most popular products: ${err}`);
    }
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const conn = await database.connect();
      const sql = 'SELECT * FROM products WHERE products.category = ($1)';
      const result = await conn.query(sql, [category]);
      return result.rows;
    } catch (err) {
      throw new Error(`Could not get product by category: ${err}`);
    }
  }
}

export default new DashboardService();