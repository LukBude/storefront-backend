import supertest from 'supertest';
import server from '../../../main/server';
import { User } from '../../../main/model/user';
import { UserStore } from '../../../main/model/UserStore';
import jwt from 'jsonwebtoken';
import { Product } from '../../../main/model/product';
import { ProductStore } from '../../../main/model/ProductStore';

describe('Test product route', () => {
  const request = supertest(server);
  const productStore = new ProductStore();

  it('/api/products/index', async () => {
    const product: Product = await productStore.addProduct({
      name: 'Naked Economics: Undressing the Dismal Science',
      price: 18.02,
      category: 'Economics'
    });

    const response = await request
      .get('/api/products/index');

    expect(response.body).toContain(product);
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
    const userStore = new UserStore();
    const admin: User = await userStore.addUser({
      firstname: 'Lisa',
      lastname: 'Simpson',
      username: 'lisa.simpson@gmail.com',
      password: 'password'
    });
    const roles: string[] = await userStore.addRoles(admin, ['USER', 'ADMIN']);
    const adminToken: string = jwt.sign({ user: admin, roles: roles }, process.env.TOKEN_SECRET!);
    const requestBody: Product = {
      name: 'Naked Money: A Revealing Look at Our Financial System',
      price: 7.93,
      category: 'Finance'
    };

    const response = await request
      .post('/api/products/create')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.body.name).toEqual(requestBody.name);
    expect(+response.body.price).toEqual(requestBody.price);
    expect(response.body.category).toEqual(requestBody.category);
  });
});