import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './route/route';
import { HttpStatusCode } from './error/HttpStatusCode';
import { ApiError } from './error/ApiError';

const server: express.Application = express();
const port = 3000;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
server.use(cors(corsOptions));

server.use(bodyParser.json());

server.use('/api', routes);

server.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof ApiError) {
    res.sendStatus(err.status);
  } else {
    res.sendStatus(HttpStatusCode.INTERNAL_SERVER);
  }
});

server.listen(port, () => {
  console.log(`server is listening on: http://localhost:${3000}`);
});

export default server;