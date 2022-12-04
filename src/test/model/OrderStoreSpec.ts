import { OrderStore } from '../../main/model/OrderStore';
import { Order } from '../../main/model/order';
import { Product } from '../../main/model/product';
import { ProductStore } from '../../main/model/ProductStore';
import { UserStore } from '../../main/model/UserStore';
import { User } from '../../main/model/user';

describe('Test OrderStore', () => {
  const orderStore = new OrderStore();
  const productStore = new ProductStore();
  const userStore = new UserStore();
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

    const orders: Order[] = await orderStore.getCompletedOrders(user.id as unknown as string);

    expect(orders).toContain(completedOrder);
  });

  it('getOrder should return requested order', async () => {
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });

    const order: Order = await orderStore.getOrder(completedOrder.id as unknown as string);

    expect(order).toEqual(completedOrder);
  });

  it('getActiveOrder should return requested order if active', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const requestedOrder: Order = await orderStore.getActiveOrder(user.id as unknown as string);

    expect(requestedOrder.id).toBe(activeOrder.id);
    expect(requestedOrder).toEqual(activeOrder);

    await orderStore.closeOrder(activeOrder.id as unknown as string);
  });

  it('getCompletedOrders should return a list of completed orders', async () => {
    const initialAmountOfOrdersInStore: number = (await orderStore.getCompletedOrders(user.id as unknown as string)).length;
    const completedOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'complete'
    });
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const orders: Order[] = await orderStore.getCompletedOrders(user.id as unknown as string);
    const finalAmountOfOrdersInStore: number = orders.length;

    expect(orders).toContain(completedOrder);
    expect(orders).not.toContain(activeOrder);
    expect(finalAmountOfOrdersInStore).toBe(initialAmountOfOrdersInStore + 1);

    await orderStore.closeOrder(activeOrder.id as unknown as string);
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
      activeOrder.id as unknown as string,
      product.id as unknown as string,
      '2');

    expect(productOfOrder.product_id).toEqual(product.id!);
    expect(productOfOrder.quantity).toEqual(2);

    await orderStore.removeOrder(activeOrder.id as unknown as string);
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
      activeOrder.id as unknown as string,
      product_1.id as unknown as string,
      '10');
    await orderStore.addProduct(
      activeOrder.id as unknown as string,
      product_2.id as unknown as string,
      '5');

    const productsOfOrder = await orderStore.getProductsOfOrder(activeOrder.id as unknown as string);

    expect(productsOfOrder).toContain({
      product_id: product_1.id!,
      quantity: 10
    });
    expect(productsOfOrder).toContain({
      product_id: product_2.id!,
      quantity: 5
    });

    await orderStore.removeOrder(activeOrder.id as unknown as string);
  });

  it('closeOrder should change the status of an active order to complete', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const closedOrder = await orderStore.closeOrder(activeOrder.id as unknown as string);

    expect(closedOrder.id).toBe(activeOrder.id);
    expect(closedOrder.status).toEqual('complete');
  });
});