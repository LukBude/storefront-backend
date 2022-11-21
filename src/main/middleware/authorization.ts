import express from 'express';
import { HttpStatusCode } from '../error/HttpStatusCode';

export const verifyRoles = (...allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!req.body.roles.some((role: string) => allowedRoles.includes(role))) {
      return res.sendStatus(HttpStatusCode.FORBIDDEN);
    }
    next();
  };
};

