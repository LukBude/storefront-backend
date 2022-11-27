import express from 'express';
import { OrderStore } from '../../model/OrderStore';
import { Order } from '../../model/order';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import { verifyAuthToken } from '../../middleware/authentication';
import { OrderDto } from '../../model/order-dto';

const orderRoute = express.Router();
const orderStore = new OrderStore();

orderRoute.get('/:id/active', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const order: Order = await orderStore.getActiveOrder(req.params.id);
    const response: OrderDto = {
      user_id: order.user_id,
      order_id: order.id!,
      status: order.status,
      products: await orderStore.getProductsOfOrder(req.params.id)
    };
    res.status(HttpStatusCode.OK).send(response);
  } catch (err) {
    next(err);
  }
});

orderRoute.get('/:id/complete', verifyAuthToken, async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const orders: Order[] = await orderStore.getCompletedOrders(req.params.id);
    const response: OrderDto[] = [];
    for (const order of orders) {
      response.push({
        user_id: order.user_id,
        order_id: order.id!,
        status: order.status,
        products: await orderStore.getProductsOfOrder(req.params.id)
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
    for (const product of req.body.products) {
      await orderStore.addProduct(req.params.id, product.product_id, product.quantity);
    }

    const order: Order = await orderStore.getOrder(req.params.id);
    const response: OrderDto = {
      user_id: order.user_id,
      order_id: order.id!,
      status: order.status,
      products: await orderStore.getProductsOfOrder(req.params.id)
    };

    res.status(HttpStatusCode.OK).send(response);
  } catch (err) {
    next(err);
  }
});

export default orderRoute;