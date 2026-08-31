const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UseGuards,
} = require('@nestjs/common');

const { AdminService } = require('./admin.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  // =========================================
  // GET /admin/dashboard
  // =========================================

  getDashboard() {
    return this.adminService.getDashboard();
  }

  // =========================================
  // GET /admin/products
  // =========================================

  getProducts(query) {
    return this.adminService.getAllProducts(query);
  }

  // =========================================
  // PATCH /admin/products/:id/approval
  // =========================================

  updateProductApproval(id, body, req) {
    const { approval_status } = body || {};

    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (!approval_status) {
      throw new BadRequestException('approval_status is required');
    }

    const adminUserId = req.user?.id || null;
    return this.adminService.updateProductApproval(id, approval_status, adminUserId);
  }

  // =========================================
  // PATCH /admin/products/:id/status
  // =========================================

  toggleProductStatus(id, body) {
    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (typeof body?.is_active !== 'boolean') {
      throw new BadRequestException('is_active must be true or false');
    }

    return this.adminService.toggleProductStatus(id, body.is_active);
  }

  // =========================================
  // DELETE /admin/products/:id
  // =========================================

  deleteProduct(id) {
    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    return this.adminService.deleteProduct(id);
  }
}

// =========================================
// CONTROLLER DECORATORS
// =========================================

Controller('admin')(AdminController);
UseGuards(JwtAuthGuard)(AdminController);

// GET /admin/dashboard
Get('dashboard')(
  AdminController.prototype,
  'getDashboard',
  Object.getOwnPropertyDescriptor(AdminController.prototype, 'getDashboard'),
);

// GET /admin/products
Get('products')(
  AdminController.prototype,
  'getProducts',
  Object.getOwnPropertyDescriptor(AdminController.prototype, 'getProducts'),
);
Query()(AdminController.prototype, 'getProducts', 0);

// PATCH /admin/products/:id/approval
Patch('products/:id/approval')(
  AdminController.prototype,
  'updateProductApproval',
  Object.getOwnPropertyDescriptor(AdminController.prototype, 'updateProductApproval'),
);
Param('id')(AdminController.prototype, 'updateProductApproval', 0);
Body()(AdminController.prototype, 'updateProductApproval', 1);
Req()(AdminController.prototype, 'updateProductApproval', 2);

// PATCH /admin/products/:id/status
Patch('products/:id/status')(
  AdminController.prototype,
  'toggleProductStatus',
  Object.getOwnPropertyDescriptor(AdminController.prototype, 'toggleProductStatus'),
);
Param('id')(AdminController.prototype, 'toggleProductStatus', 0);
Body()(AdminController.prototype, 'toggleProductStatus', 1);

// DELETE /admin/products/:id
Delete('products/:id')(
  AdminController.prototype,
  'deleteProduct',
  Object.getOwnPropertyDescriptor(AdminController.prototype, 'deleteProduct'),
);
Param('id')(AdminController.prototype, 'deleteProduct', 0);

Reflect.defineMetadata('design:paramtypes', [AdminService], AdminController);

module.exports = { AdminController };