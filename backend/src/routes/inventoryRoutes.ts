import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { InventoryController } from '../controllers/inventoryController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();
const inventoryController = new InventoryController();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => inventoryController.getAll(req, res));

router.get('/low-stock', (req: Request, res: Response) => inventoryController.getLowStock(req, res));

router.get('/warehouse/:warehouseId', (req: Request, res: Response) =>
  inventoryController.getByWarehouse(req, res)
);

router.get('/product/:productId', (req: Request, res: Response) =>
  inventoryController.getByProduct(req, res)
);

router.post(
  '/',
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('warehouseId').notEmpty().withMessage('Warehouse ID is required'),
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
    body('minimumStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum stock must be non-negative'),
    validate,
  ],
  (req: Request, res: Response) => inventoryController.create(req, res)
);

router.put(
  '/:id',
  [
    body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be non-negative'),
    body('minimumStock')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Minimum stock must be non-negative'),
    validate,
  ],
  (req: Request, res: Response) => inventoryController.update(req, res)
);

router.delete('/:id', (req, res) => inventoryController.delete(req, res));

export default router;
