import { OrderStore } from '../../main/model/OrderStore';
import { Order } from '../../main/model/order';
import { Product } from '../../main/model/product';
import { OrderProduct } from '../../main/model/order-product';
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

  it('getActiveOrder should return requested order if active', async () => {
    const activeOrder: Order = await orderStore.addOrder({
      user_id: user.id!,
      status: 'active'
    });

    const requestedOrder: Order = await orderStore.getActiveOrder(user.id as unknown as string);

    expect(requestedOrder.id).toBe(activeOrder.id);

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
    const addedProduct: Product = await productStore.addProduct({
      name: 'Lord of the Rings',
      price: 24.23,
      category: 'Fantasy'
    });

    const productOfOrder: OrderProduct = await orderStore.addProduct(
      activeOrder.id as unknown as string,
      addedProduct.id as unknown as string,
      '2');

    expect(productOfOrder.product_id).toEqual(addedProduct.id!);
    expect(productOfOrder.order_id).toEqual(activeOrder.id!);
    expect(productOfOrder.quantity).toEqual(2);

    await orderStore.closeOrder(activeOrder.id as unknown as string);
  });
});