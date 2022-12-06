import supertest from 'supertest';
import server from '../../../main/server';
import { Product } from '../../../main/model/product';
import { ProductStore } from '../../../main/model/ProductStore';
import { User } from '../../../main/model/user';
import jwt from 'jsonwebtoken';
import { OrderStore } from '../../../main/model/OrderStore';
import { Order } from '../../../main/model/order';
import { JwtPayload } from '../../../main/middleware/jwt-payload';

describe('Test order route', () => {
  const request = supertest(server);
  const orderStore = new OrderStore();
  let user: User;
  let userToken: string;

  beforeAll(async () => {
    const requestBody: User = {
      firstname: 'Marge',
      lastname: 'Simpson',
      username: 'marge.simpson@gmail.com',
      password: 'password'
    };

    const response = await request
      .post('/api/users/create')
      .send(requestBody);

    userToken = response.body.token;
    const decodedResponseToken = jwt.verify(userToken, process.env.TOKEN_SECRET!) as JwtPayload;
    user = decodedResponseToken.user;
  });

  it('/api/orders/active', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const response = await request
      .get('/api/orders/active')
      .set('authorization', `Bearer ${userToken}`);

    expect(response.body.user_id).toEqual(activeOrder.user_id);
    expect(response.body.order_id).toEqual(activeOrder.id);
    expect(response.body.status).toEqual('active');
    expect(response.body.products).toEqual([]);

    orderStore.closeOrder(activeOrder.id as unknown as string);
  });

  it('/api/orders/complete', async () => {
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });

    const response = await request
      .get('/api/orders/complete')
      .set('authorization', `Bearer ${userToken}`);

    expect(response.body).toContain({
      user_id: completedOrder.user_id,
      order_id: completedOrder.id,
      status: 'complete',
      products: []
    });
  });

  it('/api/orders/create', async () => {
    const response = await request
      .post('/api/orders/create')
      .set('authorization', `Bearer ${userToken}`);

    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.status).toEqual('active');

    orderStore.closeOrder(response.body.id);
  });

  it('/api/orders/:id/close', async () => {
    const activeOrder = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const response = await request
      .post(`/api/orders/${activeOrder.id}/close`)
      .set('authorization', `Bearer ${userToken}`);

    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.status).toEqual('complete');
  });

  it('/api/orders/:id/products', async () => {
    const product: Product = await new ProductStore().addProduct({
      name: 'The Logician and The Engineer',
      price: 22.07,
      category: 'History of Math'
    });
    const activeOrder = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });
    const requestBody = {
      products: [{
        product_id: product.id,
        quantity: 20
      }]
    };

    const response = await request
      .post(`/api/orders/${activeOrder.id}/products`)
      .send(requestBody)
      .set('authorization', `Bearer ${userToken}`);

    expect(response.body.user_id).toEqual(user.id);
    expect(response.body.order_id).toEqual(activeOrder.id);
    expect(response.body.status).toEqual('active');
    expect(response.body.products).toContain({
      product_id: product.id,
      quantity: 20
    });

    orderStore.closeOrder(activeOrder.id as unknown as string);
  });
});