import { Order } from '../../main/model/order';
import { Product } from '../../main/model/product';
import userStore from '../../main/model/UserStore';
import { User } from '../../main/model/user';
import productStore from '../../main/model/ProductStore';
import orderStore from '../../main/model/OrderStore';

describe('Test OrderStore', () => {
  let user: User;

  beforeAll(async () => {
    user = await userStore.addUser({
      firstname: 'Elanor',
      lastname: 'Brandyfoot',
      username: 'elanor.baggins@lordOfTheRings.com',
      password: 'password'
    });
  });

  it('addOrder should add an order', async () => {
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });

    const orders: Order[] = await orderStore.getCompletedOrders(user.id!);

    expect(orders).toContain(completedOrder);
  });

  it('getOrder should return requested order', async () => {
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });

    const order: Order = await orderStore.getOrder(completedOrder.id!);

    expect(order).toEqual(completedOrder);
  });

  it('getActiveOrder should return requested order if active', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const requestedOrder: Order = await orderStore.getActiveOrder(user.id!);

    expect(requestedOrder.id).toBe(activeOrder.id);
    expect(requestedOrder).toEqual(activeOrder);

    await orderStore.closeOrder(activeOrder.id!);
  });

  it('getCompletedOrders should return a list of completed orders', async () => {
    const initialAmountOfOrdersInStore: number = (await orderStore.getCompletedOrders(user.id!)).length;
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const orders: Order[] = await orderStore.getCompletedOrders(user.id!);
    const finalAmountOfOrdersInStore: number = orders.length;

    expect(orders).toContain(completedOrder);
    expect(orders).not.toContain(activeOrder);
    expect(finalAmountOfOrdersInStore).toBe(initialAmountOfOrdersInStore + 1);

    await orderStore.closeOrder(activeOrder.id!);
  });

  it('addProduct should add a product to an order', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });
    const product: Product = await productStore.addProduct({
      name: 'Lord of the Rings - The Fellowship of the Ring',
      price: 15.99,
      category: 'Fantasy'
    });

    const productOfOrder: { product_id: number, quantity: number } = await orderStore.addProduct(
      activeOrder.id!,
      product.id!,
      2);

    expect(productOfOrder.product_id).toEqual(product.id!);
    expect(productOfOrder.quantity).toEqual(2);

    await orderStore.removeOrder(activeOrder.id!);
  });

  it('getProductsOfOrder should return products of order', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });
    const product_1: Product = await productStore.addProduct({
      name: 'Lord of the Rings - The Two Towers',
      price: 16.33,
      category: 'Fantasy'
    });
    const product_2: Product = await productStore.addProduct({
      name: 'Lord of the Rings - The Return of the King',
      price: 14.99,
      category: 'Fantasy'
    });
    await orderStore.addProduct(
      activeOrder.id!,
      product_1.id!,
      10);
    await orderStore.addProduct(
      activeOrder.id!,
      product_2.id!,
      5);

    const productsOfOrder = await orderStore.getProductsOfOrder(activeOrder.id!);

    expect(productsOfOrder).toContain({
      product_id: product_1.id!,
      quantity: 10
    });
    expect(productsOfOrder).toContain({
      product_id: product_2.id!,
      quantity: 5
    });

    await orderStore.removeOrder(activeOrder.id!);
  });

  it('closeOrder should change the status of an active order to complete', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const closedOrder = await orderStore.closeOrder(activeOrder.id!);

    expect(closedOrder.id).toBe(activeOrder.id);
    expect(closedOrder.status).toEqual('complete');
  });
});