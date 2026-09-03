const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} = require('@nestjs/common');
const { CustomerService } = require('./customer.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class CustomerController {
  constructor(customerService) {
    this.customerService = customerService;
  }

  // =========================================
  // GET /customer/profile
  // =========================================

  getProfile(req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.customerService.getProfile(userId);
  }

  // =========================================
  // PATCH /customer/profile
  // =========================================

  updateProfile(body, req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.customerService.updateProfile(userId, body);
  }
}

// =========================================
// CONTROLLER DECORATORS
// =========================================

Controller('customer')(CustomerController);
UseGuards(JwtAuthGuard)(CustomerController);

// GET /customer/profile
Get('profile')(
  CustomerController.prototype,
  'getProfile',
  Object.getOwnPropertyDescriptor(CustomerController.prototype, 'getProfile'),
);
Req()(CustomerController.prototype, 'getProfile', 0);

// PATCH /customer/profile
Patch('profile')(
  CustomerController.prototype,
  'updateProfile',
  Object.getOwnPropertyDescriptor(
    CustomerController.prototype,
    'updateProfile',
  ),
);
Body()(CustomerController.prototype, 'updateProfile', 0);
Req()(CustomerController.prototype, 'updateProfile', 1);

Reflect.defineMetadata(
  'design:paramtypes',
  [CustomerService],
  CustomerController,
);

module.exports = { CustomerController };
