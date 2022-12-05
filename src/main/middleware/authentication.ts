import express from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from './jwt-payload';
import { UnauthorizedError } from '../error/UnauthorizedError';

export const verifyAuthToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader!.split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
    res.locals = {
      'user': decoded.user,
      'roles': decoded.roles
    };
    next();
  } catch (err) {
    throw new UnauthorizedError(`User is unauthorized to access this route: ${err}`);
  }
};