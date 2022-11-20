import express from 'express';
import { OrderStore } from '../../model/OrderStore';
import { Order } from '../../model/order';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import { verifyAuthToken } from '../../middleware/authentication';

const orderRoute = express.Router();
const orderStore = new OrderStore();

orderRoute.get('/active', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = await orderStore.getOrder(req.body.user_id);
    res.status(HttpStatusCode.OK).send(order);
  } catch (err) {
    next(err);
  }
});

orderRoute.get('/complete', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const orders: Order[] = await orderStore.getOrders(req.body.user_id);
    res.status(HttpStatusCode.OK).send(orders);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/create', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = { 'user_id': req.body.user_id, 'status': req.body.status };
    const newOrder: Order = await orderStore.addOrder(order);
    for (let product of req.body.products) {
      await orderStore.addProduct(newOrder.id as unknown as string, product.product_id, product.quantity);
    }
    res.status(HttpStatusCode.OK).send(order);
  } catch (err) {
    next(err);
  }
});

export default orderRoute;