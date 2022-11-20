import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_PORT_TEST,
  POSTGRES_DB,
  POSTGRES_DB_TEST,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
  ENV
} = process.env;

const database: Pool = new Pool({
    host: POSTGRES_HOST,
    port: ENV === 'test' ? parseInt(POSTGRES_PORT_TEST!, 10) : parseInt(POSTGRES_PORT!, 10),
    database: ENV === 'test' ? POSTGRES_DB_TEST : POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD
  }
);

export default database;

