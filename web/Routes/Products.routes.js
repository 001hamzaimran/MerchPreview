import { Router } from 'express';
import { getProducts } from '../Controllers/Products.Controller.js';

const router = Router();

router.get('/getProducts', getProducts);

export default router;
