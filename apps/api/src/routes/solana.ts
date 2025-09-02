import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware, requireTenantOwnerOrAdmin } from '../middleware/auth';
import { tenantMiddleware } from '../middleware/tenant';
import { asyncHandler } from '../middleware/errorHandler';
import { solanaService } from '../services/solana';
import { prisma } from '@franchiseen/database';
import { AppError, HTTP_STATUS, ERROR_CODES } from '@franchiseen/shared';

const router = Router();

/**
 * @swagger
 * /solana/config:
 *   get:
 *     summary: Get Solana configuration
 *     tags: [Solana Pay]
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
 *         description: Solana configuration retrieved successfully
 */
router.get('/config', [
  authMiddleware,
  tenantMiddleware,
], asyncHandler(async (req, res) => {
  const networkInfo = solanaService.getNetworkInfo();
  const isConfigured = solanaService.isConfigured();

  res.json({
    success: true,
    data: {
      ...networkInfo,
      isConfigured,
      supportedTokens: ['SOL', 'USDC', 'USDT'],
    },
  });
}));

/**
 * @swagger
 * /solana/payment-request:
 *   post:
 *     summary: Create a Solana Pay payment request
 *     tags: [Solana Pay]
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
 *               - label
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.000001
 *               currency:
 *                 type: string
 *                 enum: [SOL, USDC, USDT]
 *               label:
 *                 type: string
 *               message:
 *                 type: string
 *               memo:
 *                 type: string
 *               orderId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment request created successfully
 *       400:
 *         description: Invalid request parameters
 */
router.post('/payment-request', [
  authMiddleware,
  tenantMiddleware,
  requireTenantOwnerOrAdmin,
  body('amount').isFloat({ min: 0.000001 }),
  body('currency').isIn(['SOL', 'USDC', 'USDT']),
  body('label').trim().isLength({ min: 1, max: 100 }),
  body('message').optional().trim().isLength({ max: 200 }),
  body('memo').optional().trim().isLength({ max: 32 }),
  body('orderId').optional().isString(),
], asyncHandler(async (req, res) => {
  const { amount, currency, label, message, memo, orderId } = req.body;

  if (!solanaService.isConfigured()) {
    throw new AppError(
      'Solana Pay is not configured for this tenant',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  // Create Solana Pay request
  const paymentRequest = await solanaService.createPaymentRequest({
    amount,
    currency,
    label,
    message,
    memo,
    orderId,
  });

  // Store payment request in database
  const solanaPayRequest = await prisma.solanaPayRequest.create({
    data: {
      reference: paymentRequest.reference,
      recipient: paymentRequest.recipient,
      amount: paymentRequest.amount,
      splToken: paymentRequest.splToken,
      label,
      message,
      memo,
      status: 'PENDING',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      orderId,
      tenantId: req.tenantId!,
    },
  });

  res.status(201).json({
    success: true,
    data: {
      id: solanaPayRequest.id,
      reference: paymentRequest.reference,
      url: paymentRequest.url,
      recipient: paymentRequest.recipient,
      amount: paymentRequest.amount,
      currency,
      expiresAt: solanaPayRequest.expiresAt,
    },
  });
}));

/**
 * @swagger
 * /solana/payment-request/{id}:
 *   get:
 *     summary: Get payment request status
 *     tags: [Solana Pay]
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
 *         description: Payment request status retrieved successfully
 *       404:
 *         description: Payment request not found
 */
router.get('/payment-request/:id', [
  authMiddleware,
  tenantMiddleware,
  param('id').isString(),
], asyncHandler(async (req, res) => {
  const paymentRequest = await prisma.solanaPayRequest.findFirst({
    where: {
      id: req.params.id,
      tenantId: req.tenantId!,
    },
  });

  if (!paymentRequest) {
    throw new AppError(
      'Payment request not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  res.json({
    success: true,
    data: {
      id: paymentRequest.id,
      reference: paymentRequest.reference,
      status: paymentRequest.status,
      amount: paymentRequest.amount,
      recipient: paymentRequest.recipient,
      splToken: paymentRequest.splToken,
      label: paymentRequest.label,
      message: paymentRequest.message,
      expiresAt: paymentRequest.expiresAt,
      createdAt: paymentRequest.createdAt,
      updatedAt: paymentRequest.updatedAt,
    },
  });
}));

/**
 * @swagger
 * /solana/validate-payment:
 *   post:
 *     summary: Validate a Solana Pay transaction
 *     tags: [Solana Pay]
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
 *               - signature
 *               - paymentRequestId
 *             properties:
 *               signature:
 *                 type: string
 *               paymentRequestId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment validation result
 *       400:
 *         description: Invalid request parameters
 *       404:
 *         description: Payment request not found
 */
router.post('/validate-payment', [
  authMiddleware,
  tenantMiddleware,
  body('signature').isString().isLength({ min: 1 }),
  body('paymentRequestId').isString(),
], asyncHandler(async (req, res) => {
  const { signature, paymentRequestId } = req.body;

  // Get payment request from database
  const paymentRequest = await prisma.solanaPayRequest.findFirst({
    where: {
      id: paymentRequestId,
      tenantId: req.tenantId!,
    },
  });

  if (!paymentRequest) {
    throw new AppError(
      'Payment request not found',
      HTTP_STATUS.NOT_FOUND,
      ERROR_CODES.NOT_FOUND
    );
  }

  // Check if payment request has expired
  if (paymentRequest.expiresAt && paymentRequest.expiresAt < new Date()) {
    await prisma.solanaPayRequest.update({
      where: { id: paymentRequestId },
      data: { status: 'EXPIRED' },
    });

    throw new AppError(
      'Payment request has expired',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.SOLANA_PAY_EXPIRED
    );
  }

  // Validate the payment
  const validation = await solanaService.validatePayment({
    signature,
    recipient: paymentRequest.recipient,
    amount: parseFloat(paymentRequest.amount.toString()),
    splToken: paymentRequest.splToken || undefined,
    reference: paymentRequest.reference,
  });

  if (validation.isValid) {
    // Update payment request status
    await prisma.solanaPayRequest.update({
      where: { id: paymentRequestId },
      data: { status: 'CONFIRMED' },
    });

    // Create transaction record
    if (paymentRequest.orderId) {
      await prisma.transaction.create({
        data: {
          amount: paymentRequest.amount,
          currency: paymentRequest.splToken ? 'USDC' : 'SOL', // Simplified
          gateway: 'solana_pay',
          gatewayTransactionId: signature,
          kind: 'SALE',
          status: 'SUCCESS',
          solanaSignature: signature,
          solanaWallet: 'unknown', // Would need to extract from transaction
          solanaToken: paymentRequest.splToken,
          solanaAmount: paymentRequest.amount,
          orderId: paymentRequest.orderId,
        },
      });
    }
  } else {
    // Update payment request status to failed
    await prisma.solanaPayRequest.update({
      where: { id: paymentRequestId },
      data: { status: 'FAILED' },
    });
  }

  res.json({
    success: true,
    data: {
      isValid: validation.isValid,
      signature,
      status: validation.isValid ? 'confirmed' : 'failed',
      error: validation.error,
    },
  });
}));

/**
 * @swagger
 * /solana/transaction/{signature}:
 *   get:
 *     summary: Get transaction status
 *     tags: [Solana Pay]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: X-Tenant-ID
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: signature
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction status retrieved successfully
 */
router.get('/transaction/:signature', [
  authMiddleware,
  tenantMiddleware,
  param('signature').isString(),
], asyncHandler(async (req, res) => {
  const status = await solanaService.getTransactionStatus(req.params.signature);

  res.json({
    success: true,
    data: {
      signature: req.params.signature,
      ...status,
    },
  });
}));

export default router;
