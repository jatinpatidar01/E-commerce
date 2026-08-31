const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Patch,
  Req,
  UseGuards,
} = require('@nestjs/common');

const { VendorService } = require('./vendor.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class VendorController {
  constructor(vendorService) {
    this.vendorService = vendorService;
  }

  getDashboard(req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.vendorService.getDashboard(userId);
  }

  getProfile(req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    return this.vendorService.getProfile(userId);
  }

  updateProfile(body, req) {
    const userId = req.user?.id;

    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Profile data is required');
    }

    return this.vendorService.updateProfile(userId, body);
  }
}

Controller('vendors')(VendorController);

UseGuards(JwtAuthGuard)(VendorController);

Get('dashboard')(
  VendorController.prototype,
  'getDashboard',
  Object.getOwnPropertyDescriptor(VendorController.prototype, 'getDashboard'),
);

Req()(VendorController.prototype, 'getDashboard', 0);

Get('profile')(
  VendorController.prototype,
  'getProfile',
  Object.getOwnPropertyDescriptor(VendorController.prototype, 'getProfile'),
);

Req()(VendorController.prototype, 'getProfile', 0);

Patch('profile')(
  VendorController.prototype,
  'updateProfile',
  Object.getOwnPropertyDescriptor(VendorController.prototype, 'updateProfile'),
);

Body()(VendorController.prototype, 'updateProfile', 0);

Req()(VendorController.prototype, 'updateProfile', 1);

Reflect.defineMetadata('design:paramtypes', [VendorService], VendorController);

module.exports = {
  VendorController,
};
