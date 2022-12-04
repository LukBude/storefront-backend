import supertest from 'supertest';
import server from '../../../main/server';
import { ProductStore } from '../../../main/model/ProductStore';
import { OrderStore } from '../../../main/model/OrderStore';
import { User } from '../../../main/model/user';
import { UserStore } from '../../../main/model/UserStore';
import { Order } from '../../../main/model/order';
import { Product } from '../../../main/model/product';

describe('Test dashboard route', () => {
  const request = supertest(server);
  const orderStore = new OrderStore();
  let order: Order;
  let product_1: Product;
  let product_2: Product;
  let product_3: Product;

  let product_4: Product;
  beforeAll(async () => {
    const userStore = new UserStore();
    const productStore = new ProductStore();

    const user: User = await userStore.addUser({
      firstname: 'Abraham Jebediah',
      lastname: 'Simpson',
      username: 'abraham-jebediah.simpson@gmail.com',
      password: 'password'
    });

    product_1 = await productStore.addProduct({
      name: 'Harry Potter and the Philosopher\'s Stone',
      price: 33.89,
      category: 'Fantasy'
    });
    product_2 = await productStore.addProduct({
      name: 'Harry Potter and the Chamber of Secrets',
      price: 25.28,
      category: 'Fantasy'
    });
    product_3 = await productStore.addProduct({
      name: 'Rivers of London',
      price: 21.35,
      category: 'Crime'
    });
    product_4 = await productStore.addProduct({
      name: 'The Swarm',
      price: 24.77,
      category: 'Thriller'
    });

    order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    await orderStore.addProduct(order.id as unknown as string, product_1.id as unknown as string, '20');
    await orderStore.addProduct(order.id as unknown as string, product_2.id as unknown as string, '15');
    await orderStore.addProduct(order.id as unknown as string, product_3.id as unknown as string, '10');
    await orderStore.addProduct(order.id as unknown as string, product_4.id as unknown as string, '5');
  });

  afterAll(() => {
    orderStore.removeOrder(order.id as unknown as string);
  });

  it('/api/dashboard/products/popular', async () => {
    const response = await request
      .get('/api/dashboard/products/popular');

    expect(response.body).toContain(product_1);
    expect(response.body).toContain(product_2);
    expect(response.body).toContain(product_3);
    expect(response.body).not.toContain(product_4);
  });

  it('/api/dashboard/products?category={category}', async () => {
    const response = await request
      .get('/api/dashboard/products?category=Fantasy');

    expect(response.body).toContain(product_1);
    expect(response.body).toContain(product_2);
    expect(response.body).not.toContain(product_3);
    expect(response.body).not.toContain(product_4);
  });
});