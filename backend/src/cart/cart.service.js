const {
  Injectable,
  NotFoundException,
  BadRequestException,
} = require('@nestjs/common');
const { DatabaseService } = require('../database/database.service');

class CartService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // =========================================
  // GET USER CART
  // GET /cart
  // =========================================

  async getCart(userId) {
    const query = `
      SELECT
        c.id,
        c.user_id,
        c.product_id,
        c.quantity,
        c.created_at,
        c.updated_at,
        p.name AS product_name,
        p.description,
        p.price,
        p.stock,
        p.approval_status,
        p.is_active,
        cat.name AS category_name,
        v.id AS vendor_id,
        v.business_name AS vendor_name
      FROM public.cart_items c
      JOIN public.products p ON p.id = c.product_id
      LEFT JOIN public.categories cat ON cat.id = p.category_id
      LEFT JOIN public.vendors v ON v.id = p.vendor_id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `;

    const result = await this.databaseService.query(query, [userId]);
    const rawItems = result.rows;

    let totalAmount = 0;
    let totalItems = 0;

    const items = rawItems.map((item) => {
      const priceNum = Number(item.price || 0);
      const qty = item.quantity;
      const subtotal = priceNum * qty;

      totalAmount += subtotal;
      totalItems += qty;

      return {
        id: item.id,
        productId: item.product_id,
        name: item.product_name,
        description: item.description,
        price: priceNum,
        stock: item.stock,
        quantity: qty,
        categoryName: item.category_name,
        vendorId: item.vendor_id,
        vendorName: item.vendor_name,
        isAvailable: item.is_active && item.approval_status === 'approved' && item.stock > 0,
        subtotal,
      };
    });

    return {
      items,
      totalAmount,
      totalItems,
    };
  }

  // =========================================
  // ADD ITEM TO CART
  // POST /cart/items
  // =========================================

  async addItem(userId, data) {
    const productId = Number(data?.productId || data?.product_id);
    const quantity = Math.max(1, parseInt(data?.quantity, 10) || 1);

    if (!productId) {
      throw new BadRequestException('Product ID is required');
    }

    // Verify product exists and is active/approved
    const productRes = await this.databaseService.query(
      `SELECT id, stock, approval_status, is_active FROM public.products WHERE id = $1 LIMIT 1`,
      [productId],
    );

    if (productRes.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    const product = productRes.rows[0];

    if (!product.is_active || product.approval_status !== 'approved') {
      throw new BadRequestException('This product is currently unavailable');
    }

    if (product.stock <= 0) {
      throw new BadRequestException('Product is out of stock');
    }

    // Insert or update existing cart item
    const insertQuery = `
      INSERT INTO public.cart_items (user_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity = LEAST(public.cart_items.quantity + EXCLUDED.quantity, $4),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    await this.databaseService.query(insertQuery, [
      userId,
      productId,
      quantity,
      Math.max(product.stock, 99),
    ]);

    return this.getCart(userId);
  }

  // =========================================
  // UPDATE CART ITEM QUANTITY
  // PATCH /cart/items/:id
  // =========================================

  async updateItem(userId, cartItemId, data) {
    const quantity = parseInt(data?.quantity, 10);

    if (isNaN(quantity)) {
      throw new BadRequestException('Valid quantity is required');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, cartItemId);
    }

    const result = await this.databaseService.query(
      `
      UPDATE public.cart_items
      SET quantity = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND user_id = $3
      RETURNING *
      `,
      [quantity, cartItemId, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId);
  }

  // =========================================
  // REMOVE ITEM FROM CART
  // DELETE /cart/items/:id
  // =========================================

  async removeItem(userId, cartItemId) {
    const result = await this.databaseService.query(
      `DELETE FROM public.cart_items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [cartItemId, userId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Cart item not found');
    }

    return this.getCart(userId);
  }

  // =========================================
  // CLEAR CART
  // DELETE /cart
  // =========================================

  async clearCart(userId) {
    await this.databaseService.query(
      `DELETE FROM public.cart_items WHERE user_id = $1`,
      [userId],
    );

    return {
      message: 'Cart cleared successfully',
      items: [],
      totalAmount: 0,
      totalItems: 0,
    };
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], CartService);
Injectable()(CartService);

module.exports = { CartService };