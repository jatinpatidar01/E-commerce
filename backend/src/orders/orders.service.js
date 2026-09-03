const {
  Injectable,
  BadRequestException,
  NotFoundException,
} = require('@nestjs/common');
const { DatabaseService } = require('../database/database.service');
const { PaymentsService } = require('../payments/payment.service');
class OrdersService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    this.paymentsService = new PaymentsService();
  }

  // =========================================
  // CREATE ORDER (CHECKOUT)
  // POST /orders
  // =========================================

  async createOrder(customerId, data) {
    const { items, shipping_address } = data || {};

    let orderItems = [];

    // If items not provided, load from user's active cart
    if (!items || items.length === 0) {
      const cartQuery = `
        SELECT
          c.product_id,
          c.quantity,
          p.name AS product_name,
          p.price AS unit_price,
          p.stock,
          p.approval_status,
          p.is_active,
          v.id AS vendor_id,
          v.business_name AS vendor_name
        FROM public.cart_items c
        JOIN public.products p ON p.id = c.product_id
        LEFT JOIN public.vendors v ON v.id = p.vendor_id
        WHERE c.user_id = $1
      `;
      const cartRes = await this.databaseService.query(cartQuery, [customerId]);
      orderItems = cartRes.rows;
    } else {
      for (const item of items) {
        const prodRes = await this.databaseService.query(
          `
          SELECT
            p.id AS product_id,
            p.name AS product_name,
            p.price AS unit_price,
            p.stock,
            p.approval_status,
            p.is_active,
            v.id AS vendor_id,
            v.business_name AS vendor_name
          FROM public.products p
          LEFT JOIN public.vendors v ON v.id = p.vendor_id
          WHERE p.id = $1 LIMIT 1
          `,
          [item.productId || item.product_id],
        );
        if (prodRes.rows.length > 0) {
          orderItems.push({
            ...prodRes.rows[0],
            quantity: item.quantity || 1,
          });
        }
      }
    }

    if (orderItems.length === 0) {
      throw new BadRequestException(
        'Your cart is empty. Please add items to checkout.',
      );
    }

    // Verify availability and stock
    for (const item of orderItems) {
      if (!item.is_active || item.approval_status !== 'approved') {
        throw new BadRequestException(
          `Product "${item.product_name}" is currently unavailable.`,
        );
      }
      if (item.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for "${item.product_name}". Only ${item.stock} available.`,
        );
      }
    }

    const createdOrders = [];
    let grandTotal = 0;
    let amount = 0;
    // Create order records preserving snapshot details
    for (const item of orderItems) {
      const qty = item.quantity;
      const unitPrice = Number(item.unit_price);
      const totalAmount = unitPrice * qty;
      grandTotal += totalAmount;

      const orderRes = await this.databaseService.query(
        `
        INSERT INTO public.orders
        (
          customer_id,
          vendor_id,
          vendor_name,
          total_amount,
          status,
          product_id,
          product_name,
          unit_price,
          quantity,
          shipping_address
        )
        VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          customerId,
          item.vendor_id || null,
          item.vendor_name || 'Vendor',
          totalAmount,
          item.product_id,
          item.product_name,
          unitPrice,
          qty,
          shipping_address || 'Standard Delivery Address',
        ],
      );
      //  console.log('Order created:', orderRes.rows[0]);
      //  console.log('Order item details:',  qty, unitPrice, totalAmount);
      // const totalAmount = unitPrice;
      amount = amount +unitPrice * 100; 
      amount= 100;
      // Convert to paise for Razorpay
      // Decrement product stock
      // console.log('Creating Razorpay order for amount:', amount);

      await this.databaseService.query(
        `UPDATE public.products SET stock = GREATEST(0, stock - $1) WHERE id = $2`,
        [qty, item.product_id],
      );

      createdOrders.push(orderRes.rows[0]);
    }
    console.log('Total amount for Razorpay order:', amount);
   const razorpayOrder = await this.paymentsService.createOrder(amount);

    // Clear customer cart
    await this.databaseService.query(
      `DELETE FROM public.cart_items WHERE user_id = $1`,
      [customerId],
    );

    return {
      razorpayOrder,
      message: 'Order placed successfully',
      orders: createdOrders,
      totalAmount: grandTotal,
      orderCount: createdOrders.length,
    };
  }

  // =========================================
  // GET CUSTOMER ORDERS
  // GET /orders/customer
  // =========================================

  async getCustomerOrders(customerId) {
    const result = await this.databaseService.query(
      `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM public.orders o
      LEFT JOIN public.users u ON u.id = o.customer_id
      WHERE o.customer_id = $1
      ORDER BY o.created_at DESC
      `,
      [customerId],
    );

    return result.rows;
  }

  // =========================================
  // GET VENDOR ORDERS
  // GET /orders/vendor
  // =========================================

  async getVendorOrders(userId) {
    // Get vendor ID
    const vRes = await this.databaseService.query(
      `SELECT id FROM public.vendors WHERE user_id = $1 LIMIT 1`,
      [userId],
    );

    if (vRes.rows.length === 0) {
      return [];
    }

    const vendorId = vRes.rows[0].id;

    const result = await this.databaseService.query(
      `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM public.orders o
      LEFT JOIN public.users u ON u.id = o.customer_id
      WHERE o.vendor_id = $1
      ORDER BY o.created_at DESC
      `,
      [vendorId],
    );

    return result.rows;
  }

  // =========================================
  // GET ALL ADMIN ORDERS
  // GET /orders/admin
  // =========================================

  async getAllOrders() {
    const result = await this.databaseService.query(
      `
      SELECT
        o.*,
        u.name AS customer_name,
        u.email AS customer_email
      FROM public.orders o
      LEFT JOIN public.users u ON u.id = o.customer_id
      ORDER BY o.created_at DESC
      `,
    );

    return result.rows;
  }

  // =========================================
  // UPDATE ORDER STATUS
  // PATCH /orders/:id/status
  // =========================================

  async updateOrderStatus(orderId, status) {
    const validStatuses = [
      'pending',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Status must be one of: ${validStatuses.join(', ')}`,
      );
    }

    const result = await this.databaseService.query(
      `
      UPDATE public.orders
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
      `,
      [status, Number(orderId)],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Order not found');
    }

    return result.rows[0];
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], OrdersService);
Injectable()(OrdersService);

module.exports = { OrdersService };
