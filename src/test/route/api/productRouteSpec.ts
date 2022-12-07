import supertest from 'supertest';
import server from '../../../main/server';
import { User } from '../../../main/model/user';
import userStore from '../../../main/model/UserStore';
import { Product } from '../../../main/model/product';
import productStore from '../../../main/model/ProductStore';

describe('Test product route', () => {
  const request = supertest(server);
  let admin: User;
  let adminToken: string;

  beforeAll(async () => {
    admin = await userStore.addUser({
      firstname: 'Lisa',
      lastname: 'Simpson',
      username: 'lisa.simpson@gmail.com',
      password: 'password'
    });
    await userStore.addRoles(admin, ['USER', 'ADMIN']);

    const response = await request
      .post('/api/users/authenticate')
      .send({
        username: 'lisa.simpson@gmail.com',
        password: 'password'
      });

    adminToken = response.body.token;
  });

  it('/api/products/index', async () => {
    const product: Product = await productStore.addProduct({
      name: 'Naked Economics: Undressing the Dismal Science',
      price: 18.02,
      category: 'Economics'
    });
    const amountOfProducts: number = (await productStore.getAllProducts()).length;

    const response = await request
      .get('/api/products/index');

    expect(response.body).toContain(product);
    expect(response.body.length).toBe(amountOfProducts);
  });

  it('/api/products/:id/show', async () => {
    const product: Product = await productStore.addProduct({
      name: 'Naked Statistics: Stripping the Dread from the Data',
      price: 9.37,
      category: 'Statistics'
    });

    const response = await request
      .get(`/api/products/${product.id}/show`);

    expect(response.body).toEqual(product);
  });

  it('/api/products/create', async () => {
    const initialAmountOfProducts: number = (await productStore.getAllProducts()).length;
    const requestBody: Product = {
      name: 'Naked Money: A Revealing Look at Our Financial System',
      price: 7.93,
      category: 'Finance'
    };

    const response = await request
      .post('/api/products/create')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    const finalAmountOfProducts: number = (await productStore.getAllProducts()).length;

    expect(response.body.name).toEqual(requestBody.name);
    expect(+response.body.price).toEqual(requestBody.price);
    expect(response.body.category).toEqual(requestBody.category);
    expect(finalAmountOfProducts).toBe(initialAmountOfProducts + 1);
  });
});