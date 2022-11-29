import supertest from 'supertest';
import server from '../main/server';
import { User } from '../main/model/user';
import { UserStore } from '../main/model/UserStore';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { verifyRoles } from '../main/middleware/authorization';
import { JwtPayload } from '../main/middleware/jwt-payload';
import express from 'express';

describe('Test API endpoints', () => {
  const request = supertest(server);
  let adminToken: string;

  beforeAll(async () => {
    const userStore = new UserStore();
    const user: User = {
      firstname: 'Homer',
      lastname: 'Simpson',
      username: 'homer.simpson@gmail.com',
      password: 'password'
    };
    const admin: User = await userStore.addUser(user);
    const roles: string[] = await userStore.addRoles(admin, ['USER', 'ADMIN']);
    adminToken = jwt.sign({ user: admin, roles: roles }, process.env.TOKEN_SECRET!);
  });

  it('/api/users/create', async () => {
    const verifyAuthTokenSpy = jasmine.createSpy('verifyAuthToken');
    const verifyRolesSpy = jasmine.createSpy('verifyRoles');
    const requestBody: User = {
      firstname: 'Bart',
      lastname: 'Simpson',
      username: 'bart.simpson@gmail.com',
      password: 'secret'
    };

    const response = await request
      .post('/api/users/create')
      .send(requestBody)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log(response.status);
    console.log(response.body);

    const decodedResponseToken = jwt.verify(response.body, process.env.TOKEN_SECRET!) as JwtPayload;

    expect(verifyAuthTokenSpy).toHaveBeenCalled();
    expect(verifyRolesSpy).toHaveBeenCalled();
    expect(decodedResponseToken.user.firstname).toEqual(requestBody.firstname);
    expect(decodedResponseToken.user.lastname).toEqual(requestBody.lastname);
    expect(decodedResponseToken.user.username).toEqual(requestBody.username);
    expect(comparePasswords(decodedResponseToken.user.password, requestBody.password)).toBe(true);
  });

  it('/api/users/create', async () => {
    const verifyAuthTokenSpy = jasmine.createSpy('verifyAuthToken').and.callFake((req, res, next) => next());
    const verifyRolesSpy = jasmine.createSpy('verifyRoles').and.callFake((...allowedRoles) => {
      return (req: express.Request, res: express.Response, next: express.NextFunction) => next();
    });
    const requestBody: User = {
      firstname: 'Bart',
      lastname: 'Simpson',
      username: 'bart.simpson@gmail.com',
      password: 'secret'
    };

    const response = await request
      .post('/api/users/create')
      .send(requestBody);

    const decodedResponseToken = jwt.verify(response.body, process.env.TOKEN_SECRET!) as JwtPayload;

    expect(verifyAuthTokenSpy).toHaveBeenCalled();
    expect(verifyRolesSpy).toHaveBeenCalledWith('ADMIN');
    expect(decodedResponseToken.user.firstname).toEqual(requestBody.firstname);
    expect(decodedResponseToken.user.lastname).toEqual(requestBody.lastname);
    expect(decodedResponseToken.user.username).toEqual(requestBody.username);
    expect(comparePasswords(decodedResponseToken.user.password, requestBody.password)).toBe(true);
  });

  const comparePasswords = (providedEncryptedPassword: string, expectedClearTextPassword: string): boolean => {
    return bcrypt.compareSync(expectedClearTextPassword + process.env.BCRYPT_PASSWORD, providedEncryptedPassword);
  };
});