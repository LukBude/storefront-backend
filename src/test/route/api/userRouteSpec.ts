import supertest from 'supertest';
import server from '../../../main/server';
import { User } from '../../../main/model/user';
import { UserStore } from '../../../main/model/UserStore';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../main/middleware/jwt-payload';
import bcrypt from 'bcrypt';

describe('Test user route', () => {
  const request = supertest(server);
  const userStore = new UserStore();
  let admin: User;
  let adminToken: string;

  beforeAll(async () => {
    admin = await userStore.addUser({
      firstname: 'Homer',
      lastname: 'Simpson',
      username: 'homer.simpson@gmail.com',
      password: 'password'
    });
    const roles: string[] = await userStore.addRoles(admin, ['USER', 'ADMIN']);
    adminToken = jwt.sign({ user: admin, roles: roles }, process.env.TOKEN_SECRET!);
  });

  it('/api/users/index', async () => {
    const response = await request
      .get('/api/users/index')
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.body).toContain(admin);
  });

  it('/api/users/:id/show', async () => {
    const response = await request
      .get(`/api/users/${admin.id}/show`)
      .set('authorization', `Bearer ${adminToken}`);

    expect(response.body).toEqual(admin);
  });

  it('/api/users/create', async () => {
    const requestBody: User = {
      firstname: 'Bart',
      lastname: 'Simpson',
      username: 'bart.simpson@gmail.com',
      password: 'secret'
    };

    const response = await request
      .post('/api/users/create')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    const decodedResponseToken = jwt.verify(response.text, process.env.TOKEN_SECRET!) as JwtPayload;

    expect(decodedResponseToken.user.firstname).toEqual(requestBody.firstname);
    expect(decodedResponseToken.user.lastname).toEqual(requestBody.lastname);
    expect(decodedResponseToken.user.username).toEqual(requestBody.username);
    expect(comparePasswords(decodedResponseToken.user.password, requestBody.password)).toBe(true);
  });

  it('/api/users/:id/add-role', async () => {
    const user: User = await userStore.addUser({
      firstname: 'Selma',
      lastname: 'Bouvier',
      username: 'selma.bouvier@gmail.com',
      password: 'password'
    });
    const requestBody = {
      role: 'ADMIN'
    };

    const response = await request
      .post(`/api/users/${user.id}/add-role`)
      .send(requestBody);

    const decodedResponseToken = jwt.verify(response.text, process.env.TOKEN_SECRET!) as JwtPayload;

    expect(decodedResponseToken.roles).toContain('ADMIN');
  });

  it('/api/users/authenticate', async () => {
    const requestBody = {
      username: admin.username,
      password: 'password'
    };

    const response = await request
      .post('/api/users/authenticate')
      .send(requestBody)
      .set('authorization', `Bearer ${adminToken}`);

    const decodedResponseToken = jwt.verify(response.text, process.env.TOKEN_SECRET!) as JwtPayload;

    expect(decodedResponseToken.user.firstname).toEqual(admin.firstname);
    expect(decodedResponseToken.user.lastname).toEqual(admin.lastname);
    expect(decodedResponseToken.user.username).toEqual(admin.username);
    expect(comparePasswords(decodedResponseToken.user.password, requestBody.password)).toBe(true);
  });

  const comparePasswords = (providedEncryptedPassword: string, expectedClearTextPassword: string): boolean => {
    return bcrypt.compareSync(expectedClearTextPassword + process.env.BCRYPT_PASSWORD, providedEncryptedPassword);
  };
})
;