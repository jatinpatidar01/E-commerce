const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Req,
  UseGuards,
} = require('@nestjs/common');
const { OrdersService } = require('./orders.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class OrdersController {
  constructor(ordersService) {
    this.ordersService = ordersService;
  }

  // =========================================
  // POST /orders (CREATE ORDER / CHECKOUT)
  // =========================================

  createOrder(body, req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.ordersService.createOrder(userId, body);
  }

  // =========================================
  // GET /orders (GET USER ORDERS)
  // =========================================

  getOrders(req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.ordersService.getCustomerOrders(userId);
  }

  // =========================================
  // GET /orders/vendor (VENDOR ORDERS)
  // =========================================

  getVendorOrders(req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.ordersService.getVendorOrders(userId);
  }

  // =========================================
  // GET /orders/admin (ADMIN ORDERS)
  // =========================================

  getAdminOrders() {
    return this.ordersService.getAllOrders();
  }

  // =========================================
  // GET ORDER DETAILS
  // GET /orders/:id
  // =========================================

  getOrderDetails(id, req) {
    return this.ordersService.getOrderDetails(id, req.user);
  }

  // =========================================
  // PATCH /orders/:id/status
  // =========================================

  updateOrderStatus(id, body) {
    if (!id) {
      throw new BadRequestException('Order ID is required');
    }
    const { status } = body || {};
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.ordersService.updateOrderStatus(id, status);
  }
}

// =========================================
// CONTROLLER DECORATORS
// =========================================

Controller('orders')(OrdersController);
UseGuards(JwtAuthGuard)(OrdersController);

// POST /orders
Post()(
  OrdersController.prototype,
  'createOrder',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'createOrder'),
);
Body()(OrdersController.prototype, 'createOrder', 0);
Req()(OrdersController.prototype, 'createOrder', 1);

// GET /orders
Get()(
  OrdersController.prototype,
  'getOrders',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'getOrders'),
);
Req()(OrdersController.prototype, 'getOrders', 0);

// GET /orders/vendor
Get('vendor')(
  OrdersController.prototype,
  'getVendorOrders',
  Object.getOwnPropertyDescriptor(
    OrdersController.prototype,
    'getVendorOrders',
  ),
);
Req()(OrdersController.prototype, 'getVendorOrders', 0);

// GET /orders/admin
Get('admin')(
  OrdersController.prototype,
  'getAdminOrders',
  Object.getOwnPropertyDescriptor(OrdersController.prototype, 'getAdminOrders'),
);

// GET /orders/:id
Get(':id')(
  OrdersController.prototype,
  'getOrderDetails',
  Object.getOwnPropertyDescriptor(
    OrdersController.prototype,
    'getOrderDetails',
  ),
);
Param('id')(OrdersController.prototype, 'getOrderDetails', 0);
Req()(OrdersController.prototype, 'getOrderDetails', 1);

// PATCH /orders/:id/status
Patch(':id/status')(
  OrdersController.prototype,
  'updateOrderStatus',
  Object.getOwnPropertyDescriptor(
    OrdersController.prototype,
    'updateOrderStatus',
  ),
);
Param('id')(OrdersController.prototype, 'updateOrderStatus', 0);
Body()(OrdersController.prototype, 'updateOrderStatus', 1);

Reflect.defineMetadata('design:paramtypes', [OrdersService], OrdersController);

module.exports = { OrdersController };
