import { ApiError } from './ApiError';
import { HttpStatusCode } from './HttpStatusCode';

export class ForbiddenError extends ApiError {
  constructor(message: string) {
    super(message);
  }

  get status() {
    return HttpStatusCode.FORBIDDEN;
  }
}