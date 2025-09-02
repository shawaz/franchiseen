import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireTenantOwnerOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { ServiceController } from '../controllers/service';

const router = Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services for franchise
 *     tags: [Services]
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: serviceType
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  query('category').optional().isString(),
  query('serviceType').optional().isString(),
], asyncHandler(ServiceController.getServices));

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - serviceCode
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               serviceCode:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *                 default: ACTIVE
 *               category:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               basePrice:
 *                 type: number
 *               commissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               feeStructure:
 *                 type: object
 *     responses:
 *       201:
 *         description: Service created successfully
 */
router.post('/', [
  requireTenantOwnerOrAdmin,
  body('name').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('serviceCode').trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  body('category').optional().trim(),
  body('serviceType').optional().trim(),
  body('tags').optional().isArray(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('commissionRate').optional().isFloat({ min: 0, max: 1 }),
  body('feeStructure').optional().isObject(),
], asyncHandler(ServiceController.createService));

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
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
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get('/:id', [
  param('id').isString(),
], asyncHandler(ServiceController.getService));

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update service
 *     tags: [Services]
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               serviceCode:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED]
 *               category:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               basePrice:
 *                 type: number
 *               commissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               feeStructure:
 *                 type: object
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
router.put('/:id', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('name').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('serviceCode').optional().trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED']),
  body('category').optional().trim(),
  body('serviceType').optional().trim(),
  body('tags').optional().isArray(),
  body('basePrice').optional().isFloat({ min: 0 }),
  body('commissionRate').optional().isFloat({ min: 0, max: 1 }),
  body('feeStructure').optional().isObject(),
], asyncHandler(ServiceController.updateService));

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 *       400:
 *         description: Cannot delete service with existing transactions
 *       404:
 *         description: Service not found
 */
router.delete('/:id', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
], asyncHandler(ServiceController.deleteService));

/**
 * @swagger
 * /services/stats:
 *   get:
 *     summary: Get service statistics
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service statistics retrieved successfully
 */
router.get('/stats', asyncHandler(ServiceController.getServiceStats));

export default router;
