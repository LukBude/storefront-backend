import { DashboardService } from '../../main/service/DashboardService';
import { User } from '../../main/model/user';
import { UserStore } from '../../main/model/UserStore';
import { ProductStore } from '../../main/model/ProductStore';
import { Product } from '../../main/model/product';
import { OrderStore } from '../../main/model/OrderStore';
import { Order } from '../../main/model/order';

describe('Test DashboardService', () => {
  const dashboardService: DashboardService = new DashboardService();
  const userStore: UserStore = new UserStore();
  const productStore: ProductStore = new ProductStore();
  const orderStore: OrderStore = new OrderStore();

  let user_1: User;
  let user_2: User;
  let order_1: Order;
  let order_2: Order;
  let product_1: Product;
  let product_2: Product;
  let product_3: Product;
  let product_4: Product;
  let product_5: Product;

  beforeAll(async () => {
    user_1 = await userStore.addUser({
      firstname: 'Merry',
      lastname: 'Brandybuck',
      username: 'merry.brandybuck@lordOfTheRings.com',
      password: 'secret'
    });

    user_2 = await userStore.addUser({
      firstname: 'Pippin',
      lastname: 'Took',
      username: 'pippin.took@lordOfTheRings.com',
      password: 'secret'
    });

    order_1 = await orderStore.addOrder({
      user_id: user_1.id!,
      status: 'active'
    });

    order_2 = await orderStore.addOrder({
      user_id: user_2.id!,
      status: 'active'
    });

    product_1 = await productStore.addProduct({
      name: 'The Night of Wishes',
      price: 17.00,
      category: 'Fantasy'
    });

    product_2 = await productStore.addProduct({
      name: 'Nineteen-Eighty-Four 1984',
      price: 13.40,
      category: 'Science Fiction'
    });

    product_3 = await productStore.addProduct({
      name: 'Brave New World',
      price: 16.19,
      category: 'Science Fiction'
    });

    product_4 = await productStore.addProduct({
      name: 'Prisoners of Geography',
      price: 19.99,
      category: 'Politics'
    });

    product_5 = await productStore.addProduct({
      name: 'Sapiens - A Brief History of Humankind',
      price: 29.99,
      category: 'Anthropology'
    });

    await orderStore.addProduct(order_1.id as unknown as string, product_1.id as unknown as string, '50');
    await orderStore.addProduct(order_1.id as unknown as string, product_2.id as unknown as string, '40');
    await orderStore.addProduct(order_1.id as unknown as string, product_3.id as unknown as string, '30');
    await orderStore.addProduct(order_1.id as unknown as string, product_4.id as unknown as string, '20');
    await orderStore.addProduct(order_1.id as unknown as string, product_5.id as unknown as string, '10');
    await orderStore.addProduct(order_2.id as unknown as string, product_1.id as unknown as string, '50');
    await orderStore.addProduct(order_2.id as unknown as string, product_2.id as unknown as string, '40');
    await orderStore.addProduct(order_2.id as unknown as string, product_3.id as unknown as string, '30');
    await orderStore.addProduct(order_2.id as unknown as string, product_4.id as unknown as string, '20');
    await orderStore.addProduct(order_2.id as unknown as string, product_5.id as unknown as string, '10');
  });

  it('getMostPopularProducts should return the 3 most popular products', async () => {
    const products: Product[] = await dashboardService.getMostPopularProducts();
    expect(products).toEqual([product_1, product_2, product_3]);
  });

  it('getProductsByCategory should return products of requested category', async () => {
    const products: Product[] = await dashboardService.getProductsByCategory('Science Fiction');
    expect(products).toEqual([product_2, product_3]);
  });
});
