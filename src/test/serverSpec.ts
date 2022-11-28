import supertest from 'supertest';
import server from '../main/server';
import { User } from '../main/model/user';
import { verifyAuthToken } from '../main/middleware/authentication';

describe('Test API endpoints', () => {
  const request = supertest(server);

  it('/api/users/create', async () => {
    const authSpy = jasmine.createSpy('verifyAuthToken').and.callFake((req, res, next) => next());
    const requestBody: User = {
      firstname: 'Bart',
      lastname: 'Simpson',
      username: 'bart.simpson@gmail.com',
      password: 'secret'
    };
    const response = await request
      .post('/api/users/create')
      .send(requestBody);
    console.log(response);
  });

});