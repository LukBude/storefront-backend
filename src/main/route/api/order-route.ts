import express from 'express';
import { Order } from '../../model/order';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import { verifyAuthToken } from '../../middleware/authentication';
import { OrderDTO } from '../../model/order-dto';
import orderStore from '../../model/OrderStore';

const orderRoute = express.Router();

orderRoute.get('/active', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = await orderStore.getActiveOrder(res.locals['user'].id);
    const response: OrderDTO = {
      user_id: order.user_id,
      order_id: order.id!,
      status: order.status,
      products: await orderStore.getProductsOfOrder(order.id!)
    };
    res.status(HttpStatusCode.OK).send(response);
  } catch (err) {
    next(err);
  }
});

orderRoute.get('/complete', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const orders: Order[] = await orderStore.getCompletedOrders(res.locals['user'].id);
    const response: OrderDTO[] = [];
    for (const order of orders) {
      response.push({
        user_id: order.user_id,
        order_id: order.id!,
        status: order.status,
        products: await orderStore.getProductsOfOrder(order.id!)
      });
    }
    res.status(HttpStatusCode.OK).send(response);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/create', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = {
      'user_id': res.locals['user'].id,
      'status': 'active'
    };
    const newOrder: Order = await orderStore.addOrder(order);
    res.status(HttpStatusCode.OK).send(newOrder);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/:id/close', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const closedOrder: Order = await orderStore.closeOrder(+req.params.id);
    res.status(HttpStatusCode.OK).send(closedOrder);
  } catch (err) {
    next(err);
  }
});

orderRoute.post('/:id/products', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    for (const product of req.body.products) {
      await orderStore.addProduct(+req.params.id, product.product_id, product.quantity);
    }

    const order: Order = await orderStore.getOrder(+req.params.id);
    const response: OrderDTO = {
      user_id: order.user_id,
      order_id: order.id!,
      status: order.status,
      products: await orderStore.getProductsOfOrder(+req.params.id)
    };

    res.status(HttpStatusCode.OK).send(response);
  } catch (err) {
    next(err);
  }
});

export default orderRoute;