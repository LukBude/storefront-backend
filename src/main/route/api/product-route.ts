import express from 'express';
import { ProductStore } from '../../model/ProductStore';
import { Product } from '../../model/product';
import { HttpStatusCode } from '../../error/HttpStatusCode';
import { verifyAuthToken } from '../../middleware/authentication';
import { verifyRoles } from '../../middleware/authorization';

const productRoute = express.Router();
const productStore = new ProductStore();

productRoute.get('/index', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const products: Product[] = await productStore.getAllProducts();
    res.status(HttpStatusCode.OK).send(products);
  } catch (err) {
    next(err);
  }
});

productRoute.get('/:id/show', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const product: Product = await productStore.getProduct(req.params.id);
    res.status(HttpStatusCode.OK).send(product);
  } catch (err) {
    next(err);
  }
});

productRoute.post('/create', verifyAuthToken, verifyRoles('ADMIN'), async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const product: Product = {
      name: req.body.name,
      price: req.body.price,
      category: req.body.category
    };
    const newProduct: Product = await productStore.addProduct(product);
    res.status(HttpStatusCode.OK).send(newProduct);
  } catch (err) {
    next(err);
  }
});

export default productRoute;