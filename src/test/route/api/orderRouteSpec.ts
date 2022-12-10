import supertest from 'supertest';
import server from '../../../main/server';
import { Product } from '../../../main/model/product';
import { User } from '../../../main/model/user';
import { Order } from '../../../main/model/order';
import orderStore from '../../../main/model/OrderStore';
import userStore from '../../../main/model/UserStore';
import { OrderDTO } from '../../../main/model/order-dto';
import { HttpStatusCode } from '../../../main/error/HttpStatusCode';

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
    spyOn(userStore, 'authenticateUser').and.returnValue(Promise.resolve(user));
    spyOn(userStore, 'getRoles').and.returnValue(Promise.resolve(['USER']));

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
    const getActiveOrderSpy = spyOn(orderStore, 'getActiveOrder').and.returnValue(Promise.resolve(activeOrder));
    const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue(Promise.resolve([]));

    const response = await request
      .get('/api/orders/active')
      .set('authorization', `Bearer ${userToken}`);

    expect(getActiveOrderSpy).toHaveBeenCalledWith(user.id!);
    expect(getProductsOfOrderSpy).toHaveBeenCalledWith(activeOrder.id!);
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
    const getCompletedOrderSpy = spyOn(orderStore, 'getCompletedOrders').and.returnValue(Promise.resolve([completedOrder]));
    const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue(Promise.resolve([]));

    const response = await request
      .get('/api/orders/complete')
      .set('authorization', `Bearer ${userToken}`);

    expect(getCompletedOrderSpy).toHaveBeenCalledWith(user.id!);
    expect(getProductsOfOrderSpy).toHaveBeenCalledWith(completedOrder.id!);
    expect(response.body).toEqual(expectedOrderDTOs);
  });

  describe('/api/orders/create', () => {
    it('creates a new active order for the current user', async () => {
      const order: Order = {
        id: 3,
        user_id: user.id!,
        status: 'active'
      };
      const getActiveOrderSpy = spyOn(orderStore, 'getActiveOrder').and.returnValue(Promise.resolve(undefined as unknown as Order));
      const addOrderSpy = spyOn(orderStore, 'addOrder').and.returnValue(Promise.resolve(order));

      const response = await request
        .post('/api/orders/create')
        .set('authorization', `Bearer ${userToken}`);

      expect(getActiveOrderSpy).toHaveBeenCalledWith(user.id!);
      expect(addOrderSpy).toHaveBeenCalledWith({ user_id: user.id!, status: 'active' });
      expect(response.body).toEqual(order);
    });

    it('throws exception if an active order to the curent user already exists', async () => {
      const order: Order = {
        id: 3,
        user_id: user.id!,
        status: 'active'
      };
      const getActiveOrderSpy = spyOn(orderStore, 'getActiveOrder').and.returnValue(Promise.resolve(order));

      const response = await request
        .post('/api/orders/create')
        .set('authorization', `Bearer ${userToken}`);

      expect(getActiveOrderSpy).toHaveBeenCalledWith(user.id!);
      expect(response.status).toEqual(HttpStatusCode.INTERNAL_SERVER);
    });
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
    const closeOrderSpy = spyOn(orderStore, 'closeOrder').and.returnValue(Promise.resolve(completedOrder));

    const response = await request
      .post(`/api/orders/${activeOrder.id}/close`)
      .set('authorization', `Bearer ${userToken}`);

    expect(closeOrderSpy).toHaveBeenCalledWith(activeOrder.id);
    expect(response.body).toEqual(completedOrder);
  });

  describe('/api/orders/:id/products', () => {
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
    const requestBody = {
      products: productsOfOrder
    };

    it('adds products to an active order', async () => {
      const activeOrder = {
        id: 5,
        user_id: user.id!,
        status: 'active'
      };
      const expectedOrderDTO: OrderDTO = {
        user_id: activeOrder.user_id,
        order_id: activeOrder.id,
        status: 'active',
        products: productsOfOrder
      };
      const getOrderSpy = spyOn(orderStore, 'getOrder').and.returnValue(Promise.resolve(activeOrder));
      const addProductSpy = spyOn(orderStore, 'addProduct');
      const getProductsOfOrderSpy = spyOn(orderStore, 'getProductsOfOrder').and.returnValue(Promise.resolve(productsOfOrder));

      const response = await request
        .post(`/api/orders/${activeOrder.id}/products`)
        .send(requestBody)
        .set('authorization', `Bearer ${userToken}`);

      expect(addProductSpy).toHaveBeenCalledWith(activeOrder.id, productsOfOrder[0].product_id, productsOfOrder[0].quantity);
      expect(getOrderSpy).toHaveBeenCalledWith(activeOrder.id);
      expect(getProductsOfOrderSpy).toHaveBeenCalledWith(activeOrder.id);
      expect(response.body).toEqual(expectedOrderDTO);
    });

    it('throws exception if order id refers to a completed order', async () => {
      const completeOrder = {
        id: 5,
        user_id: user.id!,
        status: 'complete'
      };
      const getOrderSpy = spyOn(orderStore, 'getOrder').and.returnValue(Promise.resolve(completeOrder));

      const response = await request
        .post(`/api/orders/${completeOrder.id}/products`)
        .send(requestBody)
        .set('authorization', `Bearer ${userToken}`);

      expect(getOrderSpy).toHaveBeenCalledWith(user.id!);
      expect(response.status).toEqual(HttpStatusCode.INTERNAL_SERVER);
    });
  });
});