import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from './route/route';

const server: express.Application = express();
const port = 3000;

const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};
server.use(cors(corsOptions));

server.use(bodyParser.json());

server.use('/api', routes);

server.listen(port, () => {
  console.log(`server is listening on: http://localhost:${3000}`);
});