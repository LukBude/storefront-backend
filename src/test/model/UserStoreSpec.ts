import userStore from '../../main/model/UserStore';
import { User } from '../../main/model/user';
import bcrypt from 'bcrypt';

describe('Test UserStore', () => {

  it('addUser should add a user', async () => {
    const addedUser = await userStore.addUser({
      firstname: 'Frodo',
      lastname: 'Baggins',
      username: 'frodo.baggins@lordOfTheRings.com',
      password: 'secret'
    });
    const users: User[] = await userStore.getAllUsers();

    expect(users).toContain(addedUser);
  });

  it('addUser should encrypt password', async () => {
    const addedUser = await userStore.addUser({
      firstname: 'Elanor',
      lastname: 'Gamgee',
      username: 'elanor.gamgee@lordOfTheRings.com',
      password: 'secret'
    });
    const requestedUser: User = await userStore.getUser(addedUser.id!);

    expect(requestedUser.password).not.toEqual('secret');
    expect(comparePasswords('secret', requestedUser.password)).toBe(true);
  });

  it('getUser should return requested user', async () => {
    const user = await userStore.addUser({
      firstname: 'Samwise',
      lastname: 'Gamgee',
      username: 'samwise.gamgee@lordOfTheRings.com',
      password: 'password'
    });
    const requestedUser: User = await userStore.getUser(user.id!);

    expect(requestedUser.id).toBe(user.id);
  });

  it('getAllUsers should return a list of users', async () => {
    const initialAmountOfUsersInStore = (await userStore.getAllUsers()).length;
    await userStore.addUser({
      firstname: 'Bilbo',
      lastname: 'Baggins',
      username: 'bilbo.baggins@lordOfTheRings.com',
      password: 'password'
    });

    const finalAmountOfUsersInStore = (await userStore.getAllUsers()).length;

    expect(finalAmountOfUsersInStore).toBe(initialAmountOfUsersInStore + 1);
  });

  it('authenticateUser should return user for valid credentials', async () => {
    const user = await userStore.addUser({
      firstname: 'Belladonna',
      lastname: 'Took',
      username: 'belladonna.took@lordOfTheRings.com',
      password: 'password'
    });

    const authenticatedUser: User | null = await userStore.authenticateUser('belladonna.took@lordOfTheRings.com', 'password');

    expect(authenticatedUser).toEqual(user);
  });

  it('authenticateUser should return null for invalid credentials', async () => {
    await userStore.addUser({
      firstname: 'Lobelia',
      lastname: 'Sackville-Baggins',
      username: 'lobelia.sackville-baggins@lordOfTheRings.com',
      password: 'password'
    });

    const authenticatedUser: User | null = await userStore.authenticateUser('lobelia.sackville-baggins@lordOfTheRings.com', 'wrong password');

    expect(authenticatedUser).toBeNull();
  });

  it('getRoles should return a list of roles', async () => {
    const user = await userStore.addUser({
      firstname: 'Otho',
      lastname: 'Sackville-Baggins',
      username: 'otho.sackville-baggins@lordOfTheRings.com',
      password: 'password'
    });

    const roles: string[] = await userStore.getRoles(user);

    expect(roles).toEqual([]);
  });

  it('addRole should add a role', async () => {
    const user = await userStore.addUser({
      firstname: 'Rosie',
      lastname: 'Gamgee',
      username: 'rosie.gamgee@lordOfTheRings.com',
      password: 'password'
    });

    await userStore.addRoles(user, ['USER', 'ADMIN']);

    const roles: string[] = await userStore.getRoles(user);

    expect(roles).toHaveSize(2);
    expect(roles).toContain('USER');
    expect(roles).toContain('ADMIN');
  });

  const comparePasswords = (expectedClearTextPassword: string, providedEncryptedPassword: string): boolean => {
    return bcrypt.compareSync(expectedClearTextPassword + process.env.BCRYPT_PASSWORD, providedEncryptedPassword);
  };
});