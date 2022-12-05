import express from 'express';
import { ForbiddenError } from '../error/ForbiddenError';

export const verifyRoles = (...allowedRoles: string[]) => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!res.locals['roles'].some((role: string) => allowedRoles.includes(role))) {
      throw new ForbiddenError('User is forbidden to access this route');
    }
    next();
  };
};

