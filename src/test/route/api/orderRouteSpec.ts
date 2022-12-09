import supertest from 'supertest';
import server from '../../../main/server';
import { Product } from '../../../main/model/product';
import { User } from '../../../main/model/user';
import { Order } from '../../../main/model/order';
import orderStore from '../../../main/model/OrderStore';
import userStore from '../../../main/model/UserStore';
import { OrderDTO } from '../../../main/model/order-dto';

describe('Test order route', () => {
  const request = supertest(server);
  let user: User;
  let userToken: string;

  beforeAll(async () => {
    user = {
      id: 5,
      firstname: 'Marge',
      lastname: 'Simpson',
      username: 'marge.simpson@gmail.com',
      password: 'password'
    };
    spyOn(userStore, 'authenticateUser').and.returnValue(user);
    spyOn(userStore, 'getRoles').and.returnValue(['USER', 'ADMIN']);

    const response = await request
      .post('/api/users/authenticate')
      .send({
        username: user.username,
        password: user.password
      });

    userToken = response.body.token;
  });

  it('/api/orders/active', async () => {
    const activeOrder: Order = {
      id: 1,
      user_id: user.id!,
      status: 'active'
    };
    const expectedOrderDTO: OrderDTO = {
      user_id: activeOrder.user_id,
      order_id: activeOrder.id!,
      status: 'active',
      products: []
    };
    const getActiveOrderSpy = spyOn(orderStore, 'getActiveOrder').and.returnValue(activeOrder);
    const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue([]);

    const response = await request
      .get('/api/orders/active')
      .set('authorization', `Bearer ${userToken}`);

    expect(getActiveOrderSpy).toHaveBeenCalledWith(user.id);
    expect(getProductsOfOrderSpy).toHaveBeenCalledWith(activeOrder.id);
    expect(response.body).toEqual(expectedOrderDTO);
  });

  it('/api/orders/complete', async () => {
    const completedOrder: Order = {
      id: 2,
      user_id: user.id!,
      status: 'complete'
    };
    const expectedOrderDTOs: OrderDTO[] = [{
      user_id: completedOrder.user_id,
      order_id: completedOrder.id!,
      status: 'complete',
      products: []
    }];
    const getCompletedOrderSpy = spyOn(orderStore, 'getCompletedOrders').and.returnValue([completedOrder]);
    const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue([]);

    const response = await request
      .get('/api/orders/complete')
      .set('authorization', `Bearer ${userToken}`);

    expect(getCompletedOrderSpy).toHaveBeenCalledWith(user.id);
    expect(getProductsOfOrderSpy).toHaveBeenCalledWith(completedOrder.id);
    expect(response.body).toEqual(expectedOrderDTOs);
  });

  it('/api/orders/create', async () => {
    const order: Order = {
      id: 3,
      user_id: user.id!,
      status: 'active'
    };
    const addOrderSpy = spyOn(orderStore, 'addOrder').and.returnValue(order);

    const response = await request
      .post('/api/orders/create')
      .set('authorization', `Bearer ${userToken}`);

    expect(addOrderSpy).toHaveBeenCalledWith({ user_id: user.id, status: 'active' });
    expect(response.body).toEqual(order);
  });

  it('/api/orders/:id/close', async () => {
    const activeOrder = {
      id: 4,
      user_id: user.id!,
      status: 'active'
    };
    const completedOrder = {
      id: 4,
      user_id: user.id!,
      status: 'complete'
    };
    const closeOrderSpy = spyOn(orderStore, 'closeOrder').and.returnValue(completedOrder);

    const response = await request
      .post(`/api/orders/${activeOrder.id}/close`)
      .set('authorization', `Bearer ${userToken}`);

    expect(closeOrderSpy).toHaveBeenCalledWith(activeOrder.id);
    expect(response.body).toEqual(completedOrder);
  });

  it('/api/orders/:id/products', async () => {
    const activeOrder = {
      id: 5,
      user_id: user.id!,
      status: 'active'
    };
    const product: Product = {
      id: 1,
      name: 'The Logician and The Engineer',
      price: 22.07,
      category: 'History of Math'
    };
    const productsOfOrder: { product_id: number, quantity: number }[] = [{
      product_id: product.id!,
      quantity: 20
    }];
    const expectedOrderDTO: OrderDTO = {
      user_id: activeOrder.user_id,
      order_id: activeOrder.id,
      status: 'active',
      products: productsOfOrder
    };
    const requestBody = {
      products: productsOfOrder
    };
    const addProductSpy = spyOn(orderStore, 'addProduct');
    const getOrderSpy = spyOn(orderStore, 'getOrder').and.returnValue(activeOrder);
    const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue(productsOfOrder);

    const response = await request
      .post(`/api/orders/${activeOrder.id}/products`)
      .send(requestBody)
      .set('authorization', `Bearer ${userToken}`);

    expect(addProductSpy).toHaveBeenCalledWith(activeOrder.id, productsOfOrder[0].product_id, productsOfOrder[0].quantity);
    expect(getOrderSpy).toHaveBeenCalledWith(activeOrder.id);
    expect(getProductsOfOrderSpy).toHaveBeenCalledWith(activeOrder.id);
    expect(response.body).toEqual(expectedOrderDTO);
  });
});