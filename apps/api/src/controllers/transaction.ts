import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@franchiseen/database';
import { 
  AppError, 
  HTTP_STATUS, 
  ERROR_CODES,
  CreateTransactionInput,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  generateId
} from '@franchiseen/shared';
import { logger, logTenantAction } from '../utils/logger';

export class TransactionController {
  /**
   * Get all transactions for a franchise
   */
  static async getTransactions(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const status = req.query.status as string;
    const transactionType = req.query.transactionType as string;
    const clientId = req.query.clientId as string;
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: req.tenantId!,
    };

    if (status) {
      where.status = status;
    }

    if (transactionType) {
      where.transactionType = transactionType;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              businessName: true,
              email: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              serviceCode: true,
            },
          },
          fromAccount: {
            select: {
              id: true,
              accountNumber: true,
              accountName: true,
            },
          },
          toAccount: {
            select: {
              id: true,
              accountNumber: true,
              accountName: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
            clientType: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            serviceCode: true,
            category: true,
          },
        },
        fromAccount: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true,
            accountType: true,
          },
        },
        toAccount: {
          select: {
            id: true,
            accountNumber: true,
            accountName: true,
            accountType: true,
          },
        },
        solanaPayRequests: {
          select: {
            id: true,
            reference: true,
            status: true,
            solanaSignature: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError(
        'Transaction not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: transaction,
    });
  }

  /**
   * Create a new transaction
   */
  static async createTransaction(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const transactionData: CreateTransactionInput = req.body;
    const {
      fromAccountId,
      toAccountId,
      processingFee,
      commissionRate,
      gateway = 'internal',
      metadata = {},
    } = req.body;

    // Generate unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Verify client exists if provided
    if (transactionData.clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: transactionData.clientId,
          tenantId: req.tenantId!,
        },
      });

      if (!client) {
        throw new AppError(
          'Client not found',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }
    }

    // Verify service exists if provided
    if (transactionData.serviceId) {
      const service = await prisma.service.findFirst({
        where: {
          id: transactionData.serviceId,
          tenantId: req.tenantId!,
        },
      });

      if (!service) {
        throw new AppError(
          'Service not found',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.NOT_FOUND
        );
      }
    }

    // Calculate commission if rate provided
    let commissionAmount = 0;
    if (commissionRate && commissionRate > 0) {
      commissionAmount = Math.round(transactionData.amount * commissionRate * 100) / 100;
    }

    const transaction = await prisma.transaction.create({
      data: {
        transactionId,
        amount: transactionData.amount,
        currency: transactionData.currency,
        transactionType: transactionData.transactionType,
        category: transactionData.category,
        description: transactionData.description,
        reference: transactionData.reference,
        gateway,
        status: 'PENDING',
        processingFee,
        commissionAmount,
        metadata,
        tenantId: req.tenantId!,
        clientId: transactionData.clientId,
        serviceId: transactionData.serviceId,
        fromAccountId,
        toAccountId,
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
          },
        },
        service: {
          select: {
            id: true,
            name: true,
            serviceCode: true,
          },
        },
      },
    });

    logTenantAction('transaction_created', req.tenantId!, req.userId, {
      transactionId: transaction.transactionId,
      amount: transaction.amount,
      type: transaction.transactionType,
      clientId: transactionData.clientId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction,
    });
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, gatewayTransactionId, internalNotes } = req.body;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
    });

    if (!transaction) {
      throw new AppError(
        'Transaction not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        status,
        gatewayTransactionId,
        internalNotes,
        processedAt: status === 'SUCCESS' ? new Date() : transaction.processedAt,
        updatedAt: new Date(),
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            businessName: true,
            email: true,
          },
        },
      },
    });

    // Update client transaction count and volume if successful
    if (status === 'SUCCESS' && transaction.status !== 'SUCCESS' && transaction.clientId) {
      await prisma.client.update({
        where: { id: transaction.clientId },
        data: {
          transactionCount: { increment: 1 },
          totalVolume: { increment: transaction.amount },
        },
      });
    }

    logTenantAction('transaction_status_updated', req.tenantId!, req.userId, {
      transactionId: transaction.transactionId,
      previousStatus: transaction.status,
      newStatus: status,
    });

    res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: updatedTransaction,
    });
  }

  /**
   * Get transaction statistics
   */
  static async getTransactionStats(req: Request, res: Response): Promise<void> {
    const fromDate = req.query.fromDate as string;
    const toDate = req.query.toDate as string;

    const where: any = {
      tenantId: req.tenantId!,
    };

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    const [
      totalTransactions,
      totalVolume,
      successfulTransactions,
      pendingTransactions,
      failedTransactions,
      totalCommissions,
      totalFees,
      transactionsByType,
    ] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.transaction.count({
        where: { ...where, status: 'SUCCESS' },
      }),
      prisma.transaction.count({
        where: { ...where, status: 'PENDING' },
      }),
      prisma.transaction.count({
        where: { ...where, status: 'FAILURE' },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { commissionAmount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, status: 'SUCCESS' },
        _sum: { processingFee: true },
      }),
      prisma.transaction.groupBy({
        by: ['transactionType'],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalVolume: totalVolume._sum.amount || 0,
        successfulTransactions,
        pendingTransactions,
        failedTransactions,
        totalCommissions: totalCommissions._sum.commissionAmount || 0,
        totalFees: totalFees._sum.processingFee || 0,
        successRate: totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0,
        transactionsByType,
      },
    });
  }
}
