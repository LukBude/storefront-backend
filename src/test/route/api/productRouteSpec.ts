import supertest from 'supertest';
import server from '../../../main/server';
import { User } from '../../../main/model/user';
import userStore from '../../../main/model/UserStore';
import { Product } from '../../../main/model/product';
import productStore from '../../../main/model/ProductStore';

describe('Test product route', () => {
  const request = supertest(server);
  let adminToken: string;

  beforeAll(async () => {
    const admin: User = {
      id: 4,
      firstname: 'Lisa',
      lastname: 'Simpson',
      username: 'lisa.simpson@gmail.com',
      password: 'password'
    };
    spyOn(userStore, 'authenticateUser').and.returnValue(Promise.resolve(admin));
    spyOn(userStore, 'getRoles').and.returnValue(Promise.resolve(['USER', 'ADMIN']));

    const response = await request
      .post('/api/users/authenticate')
      .send({
        username: admin.username,
        password: admin.password
      });

    adminToken = response.body.token;
  });

  it('/api/products/index', async () => {
    const product: Product = {
      id: 1,
      name: 'Naked Economics: Undressing the Dismal Science',
      price: 18.02,
      category: 'Economics'
    };
    spyOn(productStore, 'getAllProducts').and.returnValue(Promise.resolve([product]));

    const response = await request
      .get('/api/products/index');

    expect(response.body).toEqual([product]);
  });

  it('/api/products/:id/show', async () => {
    const product: Product = {
      id: 2,
      name: 'Naked Statistics: Stripping the Dread from the Data',
      price: 9.37,
      category: 'Statistics'
    };
    const getProductSpy = spyOn(productStore, 'getProduct').and.returnValue(Promise.resolve(product));

    const response = await request
      .get(`/api/products/${product.id}/show`);

    expect(getProductSpy).toHaveBeenCalledWith(product.id!);
    expect(response.body).toEqual(product);
  });

  it('/api/products/create', async () => {
    const product: Product = {
      id: 3,
      name: 'Naked Money: A Revealing Look at Our Financial System',
      price: 7.93,
      category: 'Finance'
    };
    const requestBody: Product = {
      name: product.name,
      price: product.price,
      category: product.category
    };
    const addProductSpy = spyOn(productStore, 'addProduct').and.returnValue(Promise.resolve(product));

    const response = await request
      .post('/api/products/create')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    expect(addProductSpy).toHaveBeenCalledWith(requestBody);
    expect(response.body).toEqual(product);
  });
});