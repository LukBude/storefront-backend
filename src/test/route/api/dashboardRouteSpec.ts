import supertest from 'supertest';
import server from '../../../main/server';
import { Product } from '../../../main/model/product';
import dashboardService from '../../../main/service/DashboardService';

describe('Test dashboard route', () => {
  const request = supertest(server);
  let popularProducts: Product[];
  let productsByCategory: Product[];

  beforeAll(async () => {
    popularProducts = [
      {
        id: 1,
        name: 'Harry Potter and the Philosopher\'s Stone',
        price: 33.89,
        category: 'Fantasy'
      },
      {
        id: 3,
        name: 'Rivers of London',
        price: 21.35,
        category: 'Crime'
      },
      {
        id: 4,
        name: 'The Swarm',
        price: 24.77,
        category: 'Thriller'
      }];
    productsByCategory = [
      {
        id: 1,
        name: 'Harry Potter and the Philosopher\'s Stone',
        price: 33.89,
        category: 'Fantasy'
      },
      {
        id: 2,
        name: 'Harry Potter and the Chamber of Secrets',
        price: 25.28,
        category: 'Fantasy'
      }
    ];
  });

  it('/api/dashboard/products/popular', async () => {
    const getMostPopularProductsSpy = spyOn(dashboardService, 'getMostPopularProducts').and.returnValue(Promise.resolve(popularProducts));

    const response = await request
      .get('/api/dashboard/products/popular');

    expect(getMostPopularProductsSpy).toHaveBeenCalled();
    expect(response.body).toEqual(popularProducts);
  });

  it('/api/dashboard/products?category={category}', async () => {
    const category = 'Fantasy';
    const getProductsByCategorySpy = spyOn(dashboardService, 'getProductsByCategory').and.returnValue(Promise.resolve(productsByCategory));

    const response = await request
      .get('/api/dashboard/products?category=' + category);

    expect(getProductsByCategorySpy).toHaveBeenCalledWith(category);
    expect(response.body).toEqual(productsByCategory);
  });
});