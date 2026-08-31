const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} = require('@nestjs/common');
const { CartService } = require('./cart.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }

  // =========================================
  // GET /cart
  // =========================================

  getCart(req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.cartService.getCart(userId);
  }

  // =========================================
  // POST /cart/items
  // =========================================

  addItem(body, req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.cartService.addItem(userId, body);
  }

  // =========================================
  // PATCH /cart/items/:id
  // =========================================

  updateItem(id, body, req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.cartService.updateItem(userId, id, body);
  }

  // =========================================
  // DELETE /cart/items/:id
  // =========================================

  removeItem(id, req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.cartService.removeItem(userId, id);
  }

  // =========================================
  // DELETE /cart
  // =========================================

  clearCart(req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.cartService.clearCart(userId);
  }
}

// =========================================
// CONTROLLER DECORATORS
// =========================================

Controller('cart')(CartController);
UseGuards(JwtAuthGuard)(CartController);

// GET /cart
Get()(
  CartController.prototype,
  'getCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'getCart'),
);
Req()(CartController.prototype, 'getCart', 0);

// POST /cart/items
Post('items')(
  CartController.prototype,
  'addItem',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'addItem'),
);
Body()(CartController.prototype, 'addItem', 0);
Req()(CartController.prototype, 'addItem', 1);

// PATCH /cart/items/:id
Patch('items/:id')(
  CartController.prototype,
  'updateItem',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'updateItem'),
);
Param('id')(CartController.prototype, 'updateItem', 0);
Body()(CartController.prototype, 'updateItem', 1);
Req()(CartController.prototype, 'updateItem', 2);

// DELETE /cart/items/:id
Delete('items/:id')(
  CartController.prototype,
  'removeItem',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'removeItem'),
);
Param('id')(CartController.prototype, 'removeItem', 0);
Req()(CartController.prototype, 'removeItem', 1);

// DELETE /cart
Delete()(
  CartController.prototype,
  'clearCart',
  Object.getOwnPropertyDescriptor(CartController.prototype, 'clearCart'),
);
Req()(CartController.prototype, 'clearCart', 0);

Reflect.defineMetadata('design:paramtypes', [CartService], CartController);

module.exports = { CartController };