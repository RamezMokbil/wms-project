import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { OrderController } from '../controllers/orderController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();
const orderController = new OrderController();

router.use(authMiddleware);

router.get('/incoming', (req, res) => orderController.getIncomingOrders(req, res));

router.get('/outgoing', (req, res) => orderController.getOutgoingOrders(req, res));

router.post(
  '/in',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('warehouseId').notEmpty().withMessage('Warehouse ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
  ],
  (req: Request, res: Response) => orderController.createIncomingOrder(req, res)
);

router.post(
  '/out',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('warehouseId').notEmpty().withMessage('Warehouse ID is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    validate,
  ],
  (req: Request, res: Response) => orderController.createOutgoingOrder(req, res)
);

export default router;
