import express from 'express';
import jwt from 'jsonwebtoken';
import { HttpStatusCode } from '../error/HttpStatusCode';

export const verifyAuthToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;
    const token = authorizationHeader!.split(' ')[1];
    jwt.verify(token, process.env.TOKEN_SECRET!);
    next();
  } catch (err) {
    res.sendStatus(HttpStatusCode.UNAUTHORIZED);
  }
};