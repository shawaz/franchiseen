import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@franchiseen/database';
import { 
  AppError, 
  HTTP_STATUS, 
  ERROR_CODES,
  CreateClientInput,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from '@franchiseen/shared';
import { logger, logTenantAction } from '../utils/logger';

export class ClientController {
  /**
   * Get all clients for a franchise
   */
  static async getClients(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const status = req.query.status as string;
    const kycStatus = req.query.kycStatus as string;
    const clientType = req.query.clientType as string;
    const search = req.query.search as string;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      tenantId: req.tenantId!,
    };

    if (status) {
      where.status = status;
    }

    if (kycStatus) {
      where.kycStatus = kycStatus;
    }

    if (clientType) {
      where.clientType = clientType;
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          businessName: true,
          clientType: true,
          status: true,
          kycStatus: true,
          totalVolume: true,
          transactionCount: true,
          riskScore: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.client.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: clients,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  /**
   * Get client by ID
   */
  static async getClient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const client = await prisma.client.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
      include: {
        financialAccounts: {
          select: {
            id: true,
            accountNumber: true,
            accountType: true,
            accountName: true,
            currency: true,
            balance: true,
            availableBalance: true,
            status: true,
          },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            transactionId: true,
            amount: true,
            currency: true,
            transactionType: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!client) {
      throw new AppError(
        'Client not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: client,
    });
  }

  /**
   * Create a new client
   */
  static async createClient(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const clientData: CreateClientInput = req.body;

    // Check if client with email already exists in this franchise
    const existingClient = await prisma.client.findFirst({
      where: {
        email: clientData.email,
        tenantId: req.tenantId!,
      },
    });

    if (existingClient) {
      throw new AppError(
        'Client with this email already exists',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
    }

    const client = await prisma.client.create({
      data: {
        ...clientData,
        tenantId: req.tenantId!,
        status: 'ACTIVE',
        kycStatus: 'PENDING',
        totalVolume: 0,
        transactionCount: 0,
        addresses: [],
        tags: [],
        metadata: {},
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        clientType: true,
        status: true,
        kycStatus: true,
        creditLimit: true,
        createdAt: true,
      },
    });

    logTenantAction('client_created', req.tenantId!, req.userId, {
      clientId: client.id,
      clientEmail: client.email,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Client created successfully',
      data: client,
    });
  }

  /**
   * Update client
   */
  static async updateClient(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const client = await prisma.client.findFirst({
      where: {
        id,
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

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        businessName: true,
        clientType: true,
        status: true,
        kycStatus: true,
        creditLimit: true,
        riskScore: true,
        updatedAt: true,
      },
    });

    logTenantAction('client_updated', req.tenantId!, req.userId, {
      clientId: id,
      changes: Object.keys(updateData),
    });

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: updatedClient,
    });
  }

  /**
   * Update client KYC status
   */
  static async updateKYCStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { kycStatus, verificationNotes } = req.body;

    const client = await prisma.client.findFirst({
      where: {
        id,
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

    const updatedClient = await prisma.client.update({
      where: { id },
      data: {
        kycStatus,
        verificationDate: kycStatus === 'APPROVED' ? new Date() : null,
        metadata: {
          ...client.metadata,
          verificationNotes,
          verifiedBy: req.userId,
          verifiedAt: new Date(),
        },
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        kycStatus: true,
        verificationDate: true,
        updatedAt: true,
      },
    });

    logTenantAction('client_kyc_updated', req.tenantId!, req.userId, {
      clientId: id,
      kycStatus,
      previousStatus: client.kycStatus,
    });

    res.json({
      success: true,
      message: 'Client KYC status updated successfully',
      data: updatedClient,
    });
  }

  /**
   * Get client statistics
   */
  static async getClientStats(req: Request, res: Response): Promise<void> {
    const stats = await prisma.client.groupBy({
      by: ['status', 'kycStatus', 'clientType'],
      where: {
        tenantId: req.tenantId!,
      },
      _count: {
        id: true,
      },
      _sum: {
        totalVolume: true,
      },
    });

    const totalClients = await prisma.client.count({
      where: { tenantId: req.tenantId! },
    });

    const totalVolume = await prisma.client.aggregate({
      where: { tenantId: req.tenantId! },
      _sum: { totalVolume: true },
    });

    res.json({
      success: true,
      data: {
        totalClients,
        totalVolume: totalVolume._sum.totalVolume || 0,
        breakdown: stats,
      },
    });
  }
}
