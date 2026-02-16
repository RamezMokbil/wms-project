import { Router, Request, Response } from 'express';
import { body } from 'express-validator';
import { ProductController } from '../controllers/productController';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validator';

const router = Router();
const productController = new ProductController();

router.use(authMiddleware);

router.get('/', (req, res) => productController.getAll(req, res));

router.get('/:id', (req, res) => productController.getById(req, res));

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    validate,
  ],
  (req: Request, res: Response) => productController.create(req, res)
);

router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('category').optional().notEmpty().withMessage('Category cannot be empty'),
    body('sku').optional().notEmpty().withMessage('SKU cannot be empty'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number'),
    validate,
  ],
  (req: Request, res: Response) => productController.update(req, res)
);

router.delete('/:id', (req, res) => productController.delete(req, res));

export default router;
