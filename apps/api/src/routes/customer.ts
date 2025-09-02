import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireTenantOwnerOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ClientController } from '../controllers/client';

const router = Router();

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: Get all clients for franchise
 *     tags: [Clients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Customers retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(async (req, res) => {
  // TODO: Implement get all customers
  res.json({
    success: true,
    message: 'Get all customers endpoint - to be implemented',
    tenantId: req.tenantId,
  });
}));

/**
 * @swagger
 * /customers:
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Customer created successfully
 */
router.post('/', [
  requireTenantOwnerOrAdmin,
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1 }),
  body('lastName').trim().isLength({ min: 1 }),
], asyncHandler(async (req, res) => {
  // TODO: Implement create customer
  res.status(201).json({
    success: true,
    message: 'Create customer endpoint - to be implemented',
    tenantId: req.tenantId,
  });
}));

/**
 * @swagger
 * /customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer retrieved successfully
 *       404:
 *         description: Customer not found
 */
router.get('/:id', [
  param('id').isString(),
], asyncHandler(async (req, res) => {
  // TODO: Implement get customer by ID
  res.json({
    success: true,
    message: 'Get customer by ID endpoint - to be implemented',
    tenantId: req.tenantId,
    customerId: req.params.id,
  });
}));

export default router;
