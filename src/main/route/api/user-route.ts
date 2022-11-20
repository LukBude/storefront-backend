import express from 'express';
import { UserStore } from '../../model/UserStore';
import { User } from '../../model/user';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import jwt from 'jsonwebtoken';
import { verifyAuthToken } from '../../middleware/authentication';

const userRoute = express.Router();
const userStore = new UserStore();

userRoute.get('/index', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const users: User[] = await userStore.getAllUsers();
    res.status(HttpStatusCode.OK).send(users);
  } catch (err) {
    next(err);
  }
});

userRoute.get('/show/:id', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const user: User = await userStore.getUser(req.params.id);
    res.status(HttpStatusCode.OK).send(user);
  } catch (err) {
    next(err);
  }
});

userRoute.post('/create', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const newUser: User = await userStore.addUser(req.body);
    const token = jwt.sign({ user: newUser }, process.env.TOKEN_SECRET!);
    res.status(HttpStatusCode.OK).send(token);
  } catch (err) {
    next(err);
  }
});

userRoute.post('/authenticate', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authenticatedUser: User | null = await userStore.authenticateUser(req.body.username, req.body.password);
    if (authenticatedUser) {
      const token = jwt.sign({ user: authenticatedUser }, process.env.TOKEN_SECRET!);
      res.status(HttpStatusCode.OK).send(token);
    }
    res.sendStatus(HttpStatusCode.BAD_REQUEST);
  } catch (err) {
    next(err);
  }
});

export default userRoute;