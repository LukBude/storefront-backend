import express from 'express';
import { Product } from '../../model/product';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import dashboardService from '../../service/DashboardService';

const dashboardRoute = express.Router();

dashboardRoute.get('/products/popular', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const products: Product[] = await dashboardService.getMostPopularProducts();
    res.status(HttpStatusCode.OK).send(products);
  } catch (err) {
    next(err);
  }
});

dashboardRoute.get('/products', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const products: Product[] = await dashboardService.getProductsByCategory(req.query.category as string);
    res.status(HttpStatusCode.OK).send(products);
  } catch (err) {
    next(err);
  }
});

export default dashboardRoute;