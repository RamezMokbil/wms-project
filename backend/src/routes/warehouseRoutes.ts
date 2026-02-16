import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { WarehouseController } from '../controllers/warehouseController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();
const warehouseController = new WarehouseController();

router.use(authMiddleware);

router.get('/', (req: Request, res: Response) => warehouseController.getAll(req, res));

router.get('/:id', (req: Request, res: Response) => warehouseController.getById(req, res));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('location').notEmpty().withMessage('Location is required'),
    validate,
  ],
  (req: Request, res: Response) => warehouseController.create(req, res)
);

router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('location').optional().notEmpty().withMessage('Location cannot be empty'),
    validate,
  ],
  (req: Request, res: Response) => warehouseController.update(req, res)
);

router.delete('/:id', (req, res) => warehouseController.delete(req, res));

export default router;
