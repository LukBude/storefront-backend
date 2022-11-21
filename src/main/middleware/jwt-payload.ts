import { User } from '../model/user';

export type JwtPayload = {
  user: User,
  roles: string[]
}