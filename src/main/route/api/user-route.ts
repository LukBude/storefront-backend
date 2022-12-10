import express from 'express';
import userStore from '../../model/UserStore';
import { User } from '../../model/user';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import jwt from 'jsonwebtoken';
import { verifyAuthToken } from '../../middleware/authentication';
import { verifyRoles } from '../../middleware/authorization';

const userRoute = express.Router();

userRoute.get('/index', verifyAuthToken, verifyRoles('ADMIN'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const users: User[] = await userStore.getAllUsers();
    res.status(HttpStatusCode.OK).send(users);
  } catch (err) {
    next(err);
  }
});

userRoute.get('/:id/show', verifyAuthToken, verifyRoles('ADMIN'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user: User = await userStore.getUser(+req.params.id);
    res.status(HttpStatusCode.OK).send(user);
  } catch (err) {
    next(err);
  }
});

userRoute.post('/create', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user: User = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      password: req.body.password
    };
    const newUser: User = await userStore.addUser(user);
    const newRoles: string[] = await userStore.addRoles(newUser, ['USER']);
    const token = jwt.sign({ user: newUser, roles: newRoles }, process.env.TOKEN_SECRET!);
    res.status(HttpStatusCode.OK).send({ token: token });
  } catch (err) {
    next(err);
  }
});

userRoute.post('/:id/add-role', verifyAuthToken, verifyRoles('ADMIN'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user: User = await userStore.getUser(+req.params.id);
    await userStore.addRoles(user, [req.body.role]);
    res.sendStatus(HttpStatusCode.OK);
  } catch (err) {
    next(err);
  }
});

userRoute.post('/authenticate', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authenticatedUser: User | null = await userStore.authenticateUser(req.body.username, req.body.password);
    if (authenticatedUser) {
      const authenticatedUserRoles: string[] = await userStore.getRoles(authenticatedUser);
      const token = jwt.sign({ user: authenticatedUser, roles: authenticatedUserRoles }, process.env.TOKEN_SECRET!);
      res.status(HttpStatusCode.OK).send({ token: token });
    } else {
      res.sendStatus(HttpStatusCode.BAD_REQUEST);
    }
  } catch (err) {
    next(err);
  }
});

export default userRoute;