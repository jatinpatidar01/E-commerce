const {
  Body,
  BadRequestException,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} = require('@nestjs/common');

const { ProductsService } = require('./products.service');
const { AuthService } = require('../auth/auth.service');
const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');

function extractUserId(req, authService) {
  if (req?.user?.id) {
    return Number(req.user.id);
  }

  const authHeader = req?.headers?.authorization || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req?.cookies?.access_token) {
    token = req.cookies.access_token;
  } else if (req?.headers?.cookie) {
    const cookies = req.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [key, ...rest] = cookie.trim().split('=');
      if (key === 'access_token') {
        token = decodeURIComponent(rest.join('='));
        break;
      }
    }
  }

  if (token && authService) {
    try {
      const decoded = authService.validateAccessToken(token);
      req.user = {
        id: Number(decoded.sub) || decoded.sub,
        role: decoded.role,
      };
      return req.user.id;
    } catch {}
  }

  return null;
}

class ProductsController {
  constructor(productsService, authService) {
    this.productsService = productsService;
    this.authService = authService;
  }

  // =========================================
  // GET /products (PUBLIC - FOR CUSTOMERS)
  // =========================================

  getPublicProducts(query) {
    return this.productsService.getPublicProducts(query);
  }

  // =========================================
  // GET /products/vendor (VENDOR)
  // =========================================

  getVendorProducts(req) {
    const userId = extractUserId(req, this.authService);

    if (!userId) {
      throw new UnauthorizedException(
        'Please login as a vendor to view products',
      );
    }

    return this.productsService.getVendorProducts(userId);
  }

  // =========================================
  // GET /products/:id (PUBLIC / VENDOR)
  // =========================================

  getProduct(id, req) {
    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    const userId = extractUserId(req, this.authService);
    const vendorUserId = req?.user?.role === 'vendor' ? userId : null;

    return this.productsService.getProduct(id, vendorUserId);
  }

  // =========================================
  // POST /products (VENDOR)
  // =========================================

  createProduct(body, req) {
    const { name, category_id, price, description, stock } = body || {};

    if (!name || !category_id || price === undefined) {
      throw new BadRequestException(
        'Product name, category, and price are required',
      );
    }

    const userId = extractUserId(req, this.authService);

    if (!userId) {
      throw new UnauthorizedException(
        'Please login as a vendor to create products',
      );
    }

    return this.productsService.createProduct(userId, {
      name: String(name).trim(),
      description: String(description || '').trim(),
      category_id: Number(category_id),
      price: Number(price),
      stock: Number(stock || 0),
    });
  }

  // =========================================
  // PATCH /products/:id (VENDOR)
  // =========================================

  updateProduct(id, body, req) {
    const userId = extractUserId(req, this.authService);

    if (!userId) {
      throw new UnauthorizedException(
        'Please login as a vendor to update products',
      );
    }

    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (!body || Object.keys(body).length === 0) {
      throw new BadRequestException('Product data is required');
    }

    return this.productsService.updateProduct(userId, id, body);
  }

  // =========================================
  // DELETE /products/:id (VENDOR)
  // =========================================

  deleteProduct(id, req) {
    const userId = extractUserId(req, this.authService);

    if (!userId) {
      throw new UnauthorizedException(
        'Please login as a vendor to delete products',
      );
    }

    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    return this.productsService.deleteProduct(userId, id);
  }

  // =========================================
  // PATCH /products/:id/status (VENDOR)
  // =========================================

  toggleProductStatus(id, body, req) {
    const userId = extractUserId(req, this.authService);

    if (!userId) {
      throw new UnauthorizedException(
        'Please login as a vendor to update status',
      );
    }

    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (typeof body?.is_active !== 'boolean') {
      throw new BadRequestException('is_active must be true or false');
    }

    return this.productsService.toggleProductStatus(userId, id, body.is_active);
  }

  // =========================================
  // PATCH /products/:id/approval (ADMIN)
  // =========================================

  updateProductApproval(id, body, req) {
    const { approval_status } = body || {};

    if (!id) {
      throw new BadRequestException('Product ID is required');
    }

    if (!approval_status) {
      throw new BadRequestException('approval_status is required');
    }

    const adminUserId = extractUserId(req, this.authService);
    return this.productsService.updateProductApproval(
      id,
      approval_status,
      adminUserId,
    );
  }
}

// =========================================
// CONTROLLER DECORATORS
// =========================================

Controller('products')(ProductsController);

// GET /products (PUBLIC)
Get()(
  ProductsController.prototype,
  'getPublicProducts',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'getPublicProducts',
  ),
);
Query()(ProductsController.prototype, 'getPublicProducts', 0);

// GET /products/vendor
Get('vendor')(
  ProductsController.prototype,
  'getVendorProducts',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'getVendorProducts',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'getVendorProducts',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'getVendorProducts',
  ),
);
Req()(ProductsController.prototype, 'getVendorProducts', 0);

// GET /products/:id
Get(':id')(
  ProductsController.prototype,
  'getProduct',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'getProduct'),
);
Param('id')(ProductsController.prototype, 'getProduct', 0);
Req()(ProductsController.prototype, 'getProduct', 1);

// POST /products
Post()(
  ProductsController.prototype,
  'createProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'createProduct',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'createProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'createProduct',
  ),
);
Body()(ProductsController.prototype, 'createProduct', 0);
Req()(ProductsController.prototype, 'createProduct', 1);

// PATCH /products/:id
Patch(':id')(
  ProductsController.prototype,
  'updateProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'updateProduct',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'updateProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'updateProduct',
  ),
);
Param('id')(ProductsController.prototype, 'updateProduct', 0);
Body()(ProductsController.prototype, 'updateProduct', 1);
Req()(ProductsController.prototype, 'updateProduct', 2);

// DELETE /products/:id
Delete(':id')(
  ProductsController.prototype,
  'deleteProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'deleteProduct',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'deleteProduct',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'deleteProduct',
  ),
);
Param('id')(ProductsController.prototype, 'deleteProduct', 0);
Req()(ProductsController.prototype, 'deleteProduct', 1);

// PATCH /products/:id/status
Patch(':id/status')(
  ProductsController.prototype,
  'toggleProductStatus',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'toggleProductStatus',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'toggleProductStatus',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'toggleProductStatus',
  ),
);
Param('id')(ProductsController.prototype, 'toggleProductStatus', 0);
Body()(ProductsController.prototype, 'toggleProductStatus', 1);
Req()(ProductsController.prototype, 'toggleProductStatus', 2);

// PATCH /products/:id/approval
Patch(':id/approval')(
  ProductsController.prototype,
  'updateProductApproval',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'updateProductApproval',
  ),
);
UseGuards(JwtAuthGuard)(
  ProductsController.prototype,
  'updateProductApproval',
  Object.getOwnPropertyDescriptor(
    ProductsController.prototype,
    'updateProductApproval',
  ),
);
Param('id')(ProductsController.prototype, 'updateProductApproval', 0);
Body()(ProductsController.prototype, 'updateProductApproval', 1);
Req()(ProductsController.prototype, 'updateProductApproval', 2);

Reflect.defineMetadata(
  'design:paramtypes',
  [ProductsService, AuthService],
  ProductsController,
);

module.exports = {
  ProductsController,
};
