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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, SUSPENDED, CLOSED]
 *       - in: query
 *         name: kycStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED]
 *       - in: query
 *         name: clientType
 *         schema:
 *           type: string
 *           enum: [INDIVIDUAL, BUSINESS, CORPORATE]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Clients retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED']),
  query('kycStatus').optional().isIn(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']),
  query('clientType').optional().isIn(['INDIVIDUAL', 'BUSINESS', 'CORPORATE']),
  query('search').optional().isString(),
], asyncHandler(ClientController.getClients));

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: Create a new client
 *     tags: [Clients]
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
 *               - email
 *               - firstName
 *               - lastName
 *               - clientType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               clientType:
 *                 type: string
 *                 enum: [INDIVIDUAL, BUSINESS, CORPORATE]
 *               creditLimit:
 *                 type: number
 *     responses:
 *       201:
 *         description: Client created successfully
 */
router.post('/', [
  requireTenantOwnerOrAdmin,
  body('email').isEmail().normalizeEmail(),
  body('firstName').trim().isLength({ min: 1, max: 50 }),
  body('lastName').trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('businessName').optional().trim().isLength({ min: 1, max: 100 }),
  body('clientType').isIn(['INDIVIDUAL', 'BUSINESS', 'CORPORATE']),
  body('creditLimit').optional().isFloat({ min: 0 }),
], asyncHandler(ClientController.createClient));

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: Get client by ID
 *     tags: [Clients]
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
 *         description: Client retrieved successfully
 *       404:
 *         description: Client not found
 */
router.get('/:id', [
  param('id').isString(),
], asyncHandler(ClientController.getClient));

/**
 * @swagger
 * /clients/{id}:
 *   put:
 *     summary: Update client
 *     tags: [Clients]
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, SUSPENDED, CLOSED]
 *               creditLimit:
 *                 type: number
 *               riskScore:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 100
 *     responses:
 *       200:
 *         description: Client updated successfully
 *       404:
 *         description: Client not found
 */
router.put('/:id', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }),
  body('phone').optional().isMobilePhone('any'),
  body('businessName').optional().trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'CLOSED']),
  body('creditLimit').optional().isFloat({ min: 0 }),
  body('riskScore').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(ClientController.updateClient));

/**
 * @swagger
 * /clients/{id}/kyc:
 *   put:
 *     summary: Update client KYC status
 *     tags: [Clients]
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
 *             required:
 *               - kycStatus
 *             properties:
 *               kycStatus:
 *                 type: string
 *                 enum: [PENDING, IN_REVIEW, APPROVED, REJECTED, EXPIRED]
 *               verificationNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *       404:
 *         description: Client not found
 */
router.put('/:id/kyc', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('kycStatus').isIn(['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED']),
  body('verificationNotes').optional().trim().isLength({ max: 500 }),
], asyncHandler(ClientController.updateKYCStatus));

/**
 * @swagger
 * /clients/stats:
 *   get:
 *     summary: Get client statistics
 *     tags: [Clients]
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
 *         description: Client statistics retrieved successfully
 */
router.get('/stats', asyncHandler(ClientController.getClientStats));

export default router;
