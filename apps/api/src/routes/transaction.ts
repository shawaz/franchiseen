import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireTenantOwnerOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { TransactionController } from '../controllers/transaction';

const router = Router();

/**
 * @swagger
 * /transactions:
 *   get:
 *     summary: Get all transactions for franchise
 *     tags: [Transactions]
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
 *           enum: [PENDING, SUCCESS, FAILURE, ERROR]
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [PAYMENT, TRANSFER, DEPOSIT, WITHDRAWAL, FEE, COMMISSION, REFUND, CHARGEBACK]
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isIn(['PENDING', 'SUCCESS', 'FAILURE', 'ERROR']),
  query('transactionType').optional().isIn(['PAYMENT', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'COMMISSION', 'REFUND', 'CHARGEBACK']),
  query('clientId').optional().isString(),
  query('fromDate').optional().isISO8601(),
  query('toDate').optional().isISO8601(),
], asyncHandler(TransactionController.getTransactions));

/**
 * @swagger
 * /transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
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
 *               - amount
 *               - currency
 *               - transactionType
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 3
 *               transactionType:
 *                 type: string
 *                 enum: [PAYMENT, TRANSFER, DEPOSIT, WITHDRAWAL, FEE, COMMISSION, REFUND, CHARGEBACK]
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               reference:
 *                 type: string
 *               clientId:
 *                 type: string
 *               serviceId:
 *                 type: string
 *               fromAccountId:
 *                 type: string
 *               toAccountId:
 *                 type: string
 *               processingFee:
 *                 type: number
 *               commissionRate:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 1
 *               gateway:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Transaction created successfully
 */
router.post('/', [
  requireTenantOwnerOrAdmin,
  body('amount').isFloat({ min: 0.01 }),
  body('currency').isLength({ min: 3, max: 3 }),
  body('transactionType').isIn(['PAYMENT', 'TRANSFER', 'DEPOSIT', 'WITHDRAWAL', 'FEE', 'COMMISSION', 'REFUND', 'CHARGEBACK']),
  body('category').optional().trim(),
  body('description').optional().trim(),
  body('reference').optional().trim(),
  body('clientId').optional().isString(),
  body('serviceId').optional().isString(),
  body('fromAccountId').optional().isString(),
  body('toAccountId').optional().isString(),
  body('processingFee').optional().isFloat({ min: 0 }),
  body('commissionRate').optional().isFloat({ min: 0, max: 1 }),
  body('gateway').optional().trim(),
  body('metadata').optional().isObject(),
], asyncHandler(TransactionController.createTransaction));

/**
 * @swagger
 * /transactions/{id}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
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
 *         description: Transaction retrieved successfully
 *       404:
 *         description: Transaction not found
 */
router.get('/:id', [
  param('id').isString(),
], asyncHandler(TransactionController.getTransaction));

/**
 * @swagger
 * /transactions/{id}/status:
 *   put:
 *     summary: Update transaction status
 *     tags: [Transactions]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, SUCCESS, FAILURE, ERROR]
 *               gatewayTransactionId:
 *                 type: string
 *               internalNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction status updated successfully
 *       404:
 *         description: Transaction not found
 */
router.put('/:id/status', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('status').isIn(['PENDING', 'SUCCESS', 'FAILURE', 'ERROR']),
  body('gatewayTransactionId').optional().trim(),
  body('internalNotes').optional().trim(),
], asyncHandler(TransactionController.updateTransactionStatus));

/**
 * @swagger
 * /transactions/stats:
 *   get:
 *     summary: Get transaction statistics
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: fromDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: toDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Transaction statistics retrieved successfully
 */
router.get('/stats', [
  query('fromDate').optional().isISO8601(),
  query('toDate').optional().isISO8601(),
], asyncHandler(TransactionController.getTransactionStats));

export default router;
