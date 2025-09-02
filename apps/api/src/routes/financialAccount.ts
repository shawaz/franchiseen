import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { requireTenantOwnerOrAdmin } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { FinancialAccountController } from '../controllers/financialAccount';

const router = Router();

/**
 * @swagger
 * /financial-accounts:
 *   get:
 *     summary: Get all financial accounts for franchise
 *     tags: [Financial Accounts]
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
 *         name: accountType
 *         schema:
 *           type: string
 *           enum: [CHECKING, SAVINGS, BUSINESS, ESCROW, MERCHANT]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE, FROZEN, CLOSED]
 *       - in: query
 *         name: clientId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Financial accounts retrieved successfully
 */
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('accountType').optional().isIn(['CHECKING', 'SAVINGS', 'BUSINESS', 'ESCROW', 'MERCHANT']),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED']),
  query('clientId').optional().isString(),
], asyncHandler(FinancialAccountController.getAccounts));

/**
 * @swagger
 * /financial-accounts:
 *   post:
 *     summary: Create a new financial account
 *     tags: [Financial Accounts]
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
 *               - accountType
 *               - accountName
 *             properties:
 *               accountType:
 *                 type: string
 *                 enum: [CHECKING, SAVINGS, BUSINESS, ESCROW, MERCHANT]
 *               accountName:
 *                 type: string
 *               currency:
 *                 type: string
 *                 default: USD
 *               clientId:
 *                 type: string
 *               routingNumber:
 *                 type: string
 *               swiftCode:
 *                 type: string
 *               iban:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Financial account created successfully
 */
router.post('/', [
  requireTenantOwnerOrAdmin,
  body('accountType').isIn(['CHECKING', 'SAVINGS', 'BUSINESS', 'ESCROW', 'MERCHANT']),
  body('accountName').trim().isLength({ min: 1, max: 100 }),
  body('currency').optional().isLength({ min: 3, max: 3 }),
  body('clientId').optional().isString(),
  body('routingNumber').optional().isString(),
  body('swiftCode').optional().isString(),
  body('iban').optional().isString(),
  body('metadata').optional().isObject(),
], asyncHandler(FinancialAccountController.createAccount));

/**
 * @swagger
 * /financial-accounts/{id}:
 *   get:
 *     summary: Get financial account by ID
 *     tags: [Financial Accounts]
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
 *         description: Financial account retrieved successfully
 *       404:
 *         description: Financial account not found
 */
router.get('/:id', [
  param('id').isString(),
], asyncHandler(FinancialAccountController.getAccount));

/**
 * @swagger
 * /financial-accounts/{id}:
 *   put:
 *     summary: Update financial account
 *     tags: [Financial Accounts]
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
 *               accountName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, FROZEN, CLOSED]
 *               routingNumber:
 *                 type: string
 *               swiftCode:
 *                 type: string
 *               iban:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Financial account updated successfully
 *       404:
 *         description: Financial account not found
 */
router.put('/:id', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('accountName').optional().trim().isLength({ min: 1, max: 100 }),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE', 'FROZEN', 'CLOSED']),
  body('routingNumber').optional().isString(),
  body('swiftCode').optional().isString(),
  body('iban').optional().isString(),
  body('metadata').optional().isObject(),
], asyncHandler(FinancialAccountController.updateAccount));

/**
 * @swagger
 * /financial-accounts/{id}/balance:
 *   put:
 *     summary: Update account balance
 *     tags: [Financial Accounts]
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
 *               - amount
 *               - type
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               type:
 *                 type: string
 *                 enum: [credit, debit]
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account balance updated successfully
 *       400:
 *         description: Insufficient funds or invalid operation
 *       404:
 *         description: Financial account not found
 */
router.put('/:id/balance', [
  requireTenantOwnerOrAdmin,
  param('id').isString(),
  body('amount').isFloat({ min: 0.01 }),
  body('type').isIn(['credit', 'debit']),
  body('description').optional().trim().isLength({ max: 255 }),
], asyncHandler(FinancialAccountController.updateBalance));

/**
 * @swagger
 * /financial-accounts/{id}/history:
 *   get:
 *     summary: Get account balance history
 *     tags: [Financial Accounts]
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
 *         description: Account balance history retrieved successfully
 *       404:
 *         description: Financial account not found
 */
router.get('/:id/history', [
  param('id').isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(FinancialAccountController.getBalanceHistory));

export default router;
