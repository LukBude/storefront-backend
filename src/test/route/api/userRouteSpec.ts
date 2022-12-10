import supertest from 'supertest';
import server from '../../../main/server';
import { User } from '../../../main/model/user';
import userStore from '../../../main/model/UserStore';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../main/middleware/jwt-payload';
import { HttpStatusCode } from '../../../main/error/HttpStatusCode';

describe('Test user route', () => {
  const request = supertest(server);
  let admin: User;
  let adminToken: string;

  beforeAll(async () => {
    admin = {
      id: 1,
      firstname: 'Homer',
      lastname: 'Simpson',
      username: 'homer.simpson@gmail.com',
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

  it('/api/users/index', async () => {
    spyOn(userStore, 'getAllUsers').and.returnValue(Promise.resolve([admin]));

    const response = await request
      .get('/api/users/index')
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.body).toEqual([admin]);
  });


  it('/api/users/:id/show', async () => {
    const getUserSpy = spyOn(userStore, 'getUser').and.returnValue(Promise.resolve(admin));

    const response = await request
      .get(`/api/users/${admin.id}/show`)
      .set('authorization', `Bearer ${adminToken}`);

    expect(getUserSpy).toHaveBeenCalledWith(admin.id!);
    expect(response.body).toEqual(admin);
  });

  it('/api/users/create', async () => {
    const user: User = {
      id: 2,
      firstname: 'Bart',
      lastname: 'Simpson',
      username: 'bart.simpson@gmail.com',
      password: 'secret'
    };
    const requestBody: User = {
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      password: user.password
    };
    const addUserSpy = spyOn(userStore, 'addUser').and.returnValue(Promise.resolve(user));
    const addRolesSpy = spyOn(userStore, 'addRoles').and.returnValue(Promise.resolve(['USER']));

    const response = await request
      .post('/api/users/create')
      .send(requestBody);

    expect(addUserSpy).toHaveBeenCalledWith(requestBody);
    expect(addRolesSpy).toHaveBeenCalledWith(user, ['USER']);
    assertDecodedToken(decodeResponseToken(response.body.token), requestBody, ['USER']);
  });

  it('/api/users/:id/add-role', async () => {
    const user: User = {
      id: 3,
      firstname: 'Selma',
      lastname: 'Bouvier',
      username: 'selma.bouvier@gmail.com',
      password: 'password'
    };
    const requestBody = {
      role: 'ADMIN'
    };
    const getUserSpy = spyOn(userStore, 'getUser').and.returnValue(Promise.resolve(user));
    const addRolesSpy = spyOn(userStore, 'addRoles').and.returnValue(Promise.resolve([requestBody.role]));

    const response = await request
      .post(`/api/users/${user.id}/add-role`)
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(HttpStatusCode.OK);
    expect(getUserSpy).toHaveBeenCalledWith(user.id!);
    expect(addRolesSpy).toHaveBeenCalledWith(user, [requestBody.role]);
  });

  it('/api/users/authenticate', async () => {
    const requestBody = {
      username: admin.username,
      password: admin.password
    };

    const response = await request
      .post('/api/users/authenticate')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    assertDecodedToken(decodeResponseToken(response.body.token), admin, ['USER', 'ADMIN']);
  });

  const decodeResponseToken = (token: string): JwtPayload => {
    return jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
  };

  const assertDecodedToken = (decodedToken: JwtPayload, user: User, roles: string[]): void => {
    expect(decodedToken.user.firstname).toEqual(user.firstname);
    expect(decodedToken.user.lastname).toEqual(user.lastname);
    expect(decodedToken.user.username).toEqual(user.username);
    expect(decodedToken.user.password).toEqual(user.password);
    expect(decodedToken.roles).toEqual(roles);
  };
});