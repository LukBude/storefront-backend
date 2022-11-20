import express from 'express';
import productRoute from './api/product-route';
import orderRoute from './api/order-route';
import userRoute from './api/user-route';
import dashboardRoute from './api/dashboard-route';

const routes = express.Router();

routes.use('/users', userRoute);
routes.use('/products', productRoute);
routes.use('/orders', orderRoute);
routes.use('/dashboard', dashboardRoute);

export default routes;