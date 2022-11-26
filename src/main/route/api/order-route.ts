import express from 'express';
import { OrderStore } from '../../model/OrderStore';
import { Order } from '../../model/order';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import { verifyAuthToken } from '../../middleware/authentication';
import { OrderProduct } from '../../model/order-product';

const orderRoute = express.Router();
const orderStore = new OrderStore();

orderRoute.get('/active', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = await orderStore.getActiveOrder(req.body.user_id);
    res.status(HttpStatusCode.OK).send(order);
  } catch (err) {
    next(err);
  }
});

orderRoute.get('/complete', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const orders: Order[] = await orderStore.getCompletedOrders(req.body.user_id);
    res.status(HttpStatusCode.OK).send(orders);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/create', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = {
      'user_id': req.body.user_id,
      'status': 'active'
    };
    const newOrder: Order = await orderStore.addOrder(order);
    res.status(HttpStatusCode.OK).send(newOrder);
  } catch (err) {
    next(err);
  }
});

orderRoute.post(':id/close', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const closedOrder = await orderStore.closeOrder(req.params.id);
    res.status(HttpStatusCode.OK).send(closedOrder);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/:id/products', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const productsOfOrders: OrderProduct[] = [];
    for (let product of req.body.products) {
      const addedProduct = await orderStore.addProduct(req.params.id, product.product_id, product.quantity);
      productsOfOrders.push(addedProduct);
    }
    res.status(HttpStatusCode.OK).send(productsOfOrders);
  } catch (err) {
    next(err);
  }
});

export default orderRoute;