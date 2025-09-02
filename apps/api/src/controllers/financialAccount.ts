import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@franchiseen/database';
import { 
  AppError, 
  HTTP_STATUS, 
  ERROR_CODES,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  generateId
} from '@franchiseen/shared';
import { logger, logTenantAction } from '../utils/logger';

export class FinancialAccountController {
  /**
   * Get all financial accounts for a franchise
   */
  static async getAccounts(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const accountType = req.query.accountType as string;
    const status = req.query.status as string;
    const clientId = req.query.clientId as string;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: req.tenantId!,
    };

    if (accountType) {
      where.accountType = accountType;
    }

    if (status) {
      where.status = status;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    const [accounts, total] = await Promise.all([
      prisma.financialAccount.findMany({
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
        },
      }),
      prisma.financialAccount.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  /**
   * Get account by ID
   */
  static async getAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const account = await prisma.financialAccount.findFirst({
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
        transactions: {
          take: 20,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            transactionId: true,
            amount: true,
            currency: true,
            transactionType: true,
            status: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!account) {
      throw new AppError(
        'Financial account not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: account,
    });
  }

  /**
   * Create a new financial account
   */
  static async createAccount(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const {
      accountType,
      accountName,
      currency = 'USD',
      clientId,
      routingNumber,
      swiftCode,
      iban,
      metadata = {},
    } = req.body;

    // Generate unique account number
    const accountNumber = `${accountType.substring(0, 3).toUpperCase()}${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Verify client exists if provided
    if (clientId) {
      const client = await prisma.client.findFirst({
        where: {
          id: clientId,
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

    const account = await prisma.financialAccount.create({
      data: {
        accountNumber,
        accountType,
        accountName,
        currency,
        balance: 0,
        availableBalance: 0,
        status: 'ACTIVE',
        routingNumber,
        swiftCode,
        iban,
        metadata,
        clientId,
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
          },
        },
      },
    });

    logTenantAction('financial_account_created', req.tenantId!, req.userId, {
      accountId: account.id,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      clientId,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Financial account created successfully',
      data: account,
    });
  }

  /**
   * Update account
   */
  static async updateAccount(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const account = await prisma.financialAccount.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
    });

    if (!account) {
      throw new AppError(
        'Financial account not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    const updatedAccount = await prisma.financialAccount.update({
      where: { id },
      data: {
        ...updateData,
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

    logTenantAction('financial_account_updated', req.tenantId!, req.userId, {
      accountId: id,
      changes: Object.keys(updateData),
    });

    res.json({
      success: true,
      message: 'Financial account updated successfully',
      data: updatedAccount,
    });
  }

  /**
   * Update account balance
   */
  static async updateBalance(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { amount, type, description } = req.body;

    const account = await prisma.financialAccount.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
    });

    if (!account) {
      throw new AppError(
        'Financial account not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    if (account.status !== 'ACTIVE') {
      throw new AppError(
        'Cannot update balance for inactive account',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const newBalance = type === 'credit' 
      ? parseFloat(account.balance.toString()) + amount
      : parseFloat(account.balance.toString()) - amount;

    if (newBalance < 0 && type === 'debit') {
      throw new AppError(
        'Insufficient funds',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    // Update account balance and create transaction record
    const [updatedAccount] = await prisma.$transaction([
      prisma.financialAccount.update({
        where: { id },
        data: {
          balance: newBalance,
          availableBalance: newBalance, // Simplified - in real system would consider holds
        },
      }),
      prisma.transaction.create({
        data: {
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          amount: Math.abs(amount),
          currency: account.currency,
          transactionType: type === 'credit' ? 'DEPOSIT' : 'WITHDRAWAL',
          category: 'balance_adjustment',
          description: description || `Balance ${type}`,
          gateway: 'internal',
          status: 'SUCCESS',
          processedAt: new Date(),
          tenantId: req.tenantId!,
          clientId: account.clientId,
          [type === 'credit' ? 'toAccountId' : 'fromAccountId']: id,
          metadata: {
            adjustmentType: type,
            previousBalance: account.balance,
            newBalance,
            adjustedBy: req.userId,
          },
        },
      }),
    ]);

    logTenantAction('account_balance_updated', req.tenantId!, req.userId, {
      accountId: id,
      type,
      amount,
      previousBalance: account.balance,
      newBalance,
    });

    res.json({
      success: true,
      message: 'Account balance updated successfully',
      data: {
        accountId: id,
        previousBalance: account.balance,
        newBalance,
        adjustment: amount,
        type,
      },
    });
  }

  /**
   * Get account balance history
   */
  static async getBalanceHistory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);

    const skip = (page - 1) * limit;

    const account = await prisma.financialAccount.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
    });

    if (!account) {
      throw new AppError(
        'Financial account not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          OR: [
            { fromAccountId: id },
            { toAccountId: id },
          ],
          tenantId: req.tenantId!,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          transactionId: true,
          amount: true,
          currency: true,
          transactionType: true,
          description: true,
          status: true,
          createdAt: true,
          fromAccountId: true,
          toAccountId: true,
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { fromAccountId: id },
            { toAccountId: id },
          ],
          tenantId: req.tenantId!,
        },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        account: {
          id: account.id,
          accountNumber: account.accountNumber,
          accountName: account.accountName,
          balance: account.balance,
          availableBalance: account.availableBalance,
        },
        transactions,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }
}
