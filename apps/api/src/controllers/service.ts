import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { prisma } from '@franchiseen/database';
import { 
  AppError, 
  HTTP_STATUS, 
  ERROR_CODES,
  CreateServiceInput,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
} from '@franchiseen/shared';
import { logger, logTenantAction } from '../utils/logger';

export class ServiceController {
  /**
   * Get all services for a franchise
   */
  static async getServices(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const status = req.query.status as string;
    const category = req.query.category as string;
    const serviceType = req.query.serviceType as string;

    const skip = (page - 1) * limit;

    const where: any = {
      tenantId: req.tenantId!,
    };

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (serviceType) {
      where.serviceType = serviceType;
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          description: true,
          serviceCode: true,
          status: true,
          category: true,
          serviceType: true,
          tags: true,
          basePrice: true,
          commissionRate: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            transactions: true,
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: services,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }

  /**
   * Get service by ID
   */
  static async getService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            transactionId: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                businessName: true,
              },
            },
          },
        },
        _count: {
          transactions: true,
        },
      },
    });

    if (!service) {
      throw new AppError(
        'Service not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    res.json({
      success: true,
      data: service,
    });
  }

  /**
   * Create a new service
   */
  static async createService(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError(
        'Validation failed',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    const serviceData: CreateServiceInput = req.body;

    // Check if service with code already exists in this franchise
    const existingService = await prisma.service.findFirst({
      where: {
        serviceCode: serviceData.serviceCode,
        tenantId: req.tenantId!,
      },
    });

    if (existingService) {
      throw new AppError(
        'Service with this code already exists',
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.DUPLICATE_RESOURCE
      );
    }

    const service = await prisma.service.create({
      data: {
        ...serviceData,
        tenantId: req.tenantId!,
        metadata: serviceData.feeStructure || {},
        feeStructure: serviceData.feeStructure || {},
      },
      select: {
        id: true,
        name: true,
        description: true,
        serviceCode: true,
        status: true,
        category: true,
        serviceType: true,
        tags: true,
        basePrice: true,
        commissionRate: true,
        feeStructure: true,
        createdAt: true,
      },
    });

    logTenantAction('service_created', req.tenantId!, req.userId, {
      serviceId: service.id,
      serviceCode: service.serviceCode,
      serviceName: service.name,
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  }

  /**
   * Update service
   */
  static async updateService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const updateData = req.body;

    const service = await prisma.service.findFirst({
      where: {
        id,
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

    // Check if service code is being changed and if it conflicts
    if (updateData.serviceCode && updateData.serviceCode !== service.serviceCode) {
      const existingService = await prisma.service.findFirst({
        where: {
          serviceCode: updateData.serviceCode,
          tenantId: req.tenantId!,
          id: { not: id },
        },
      });

      if (existingService) {
        throw new AppError(
          'Service with this code already exists',
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.DUPLICATE_RESOURCE
        );
      }
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        serviceCode: true,
        status: true,
        category: true,
        serviceType: true,
        tags: true,
        basePrice: true,
        commissionRate: true,
        feeStructure: true,
        updatedAt: true,
      },
    });

    logTenantAction('service_updated', req.tenantId!, req.userId, {
      serviceId: id,
      changes: Object.keys(updateData),
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  }

  /**
   * Delete service
   */
  static async deleteService(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const service = await prisma.service.findFirst({
      where: {
        id,
        tenantId: req.tenantId!,
      },
      include: {
        _count: {
          transactions: true,
        },
      },
    });

    if (!service) {
      throw new AppError(
        'Service not found',
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.NOT_FOUND
      );
    }

    // Check if service has transactions
    if (service._count.transactions > 0) {
      throw new AppError(
        'Cannot delete service with existing transactions. Set status to INACTIVE instead.',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.VALIDATION_ERROR
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    logTenantAction('service_deleted', req.tenantId!, req.userId, {
      serviceId: id,
      serviceName: service.name,
      serviceCode: service.serviceCode,
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
    });
  }

  /**
   * Get service statistics
   */
  static async getServiceStats(req: Request, res: Response): Promise<void> {
    const stats = await prisma.service.groupBy({
      by: ['status', 'category', 'serviceType'],
      where: {
        tenantId: req.tenantId!,
      },
      _count: {
        id: true,
      },
    });

    const totalServices = await prisma.service.count({
      where: { tenantId: req.tenantId! },
    });

    const serviceRevenue = await prisma.transaction.aggregate({
      where: {
        tenantId: req.tenantId!,
        status: 'SUCCESS',
        service: {
          tenantId: req.tenantId!,
        },
      },
      _sum: {
        amount: true,
        commissionAmount: true,
      },
    });

    res.json({
      success: true,
      data: {
        totalServices,
        totalRevenue: serviceRevenue._sum.amount || 0,
        totalCommissions: serviceRevenue._sum.commissionAmount || 0,
        breakdown: stats,
      },
    });
  }
}
