import express from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatusCode } from '../error/HttpStatusCode';
import { JwtPayload } from './jwt-payload';

export const verifyAuthToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader!.split(' ')[1];
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET!) as JwtPayload;
    req.body.roles = decoded.roles;
    next();
  } catch (err) {
    return res.sendStatus(HttpStatusCode.UNAUTHORIZED);
  }
};