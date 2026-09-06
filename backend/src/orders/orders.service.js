const {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ServiceUnavailableException,
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

    // Load items from cart if items are not provided
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
      // Load products from request items
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
        WHERE p.id = $1
        LIMIT 1
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

    // Cart/order items are empty
    if (orderItems.length === 0) {
      throw new BadRequestException(
        'Your cart is empty. Please add items to checkout.',
      );
    }

    // Check product availability and stock
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

    for (const item of orderItems) {
      const qty = item.quantity;
      const unitPrice = Number(item.unit_price);

      const totalAmount = unitPrice * qty;

      grandTotal += totalAmount;
    }

    console.log('Grand total:', grandTotal);
    // Create pending orders
    const razorpayAmount = 100;
    console.log('Razorpay amount:', razorpayAmount, 'paise (₹1)');

    // const razorpayOrder = await this.paymentsService.createOrder(
    //   razorpayAmount,
    //   { notes: { customer_id: String(customerId) } },
    // );
    const razorpayOrder =
      await this.paymentsService.createOrder(razorpayAmount);

    for (const item of orderItems) {
      const qty = item.quantity;
      const unitPrice = Number(item.unit_price);
      const totalAmount = unitPrice * qty;

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
        shipping_address,
        razorpay_order_id
      )
      VALUES
      ($1, $2, $3, $4, 'pending', $5, $6, $7, $8, $9, $10)
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
          razorpayOrder ? razorpayOrder.id : null,
        ],
      );

      createdOrders.push(orderRes.rows[0]);
    }

    // For now Razorpay amount is fixed to ₹1 = 100 paise

    // Create Razorpay order

    // Save Razorpay order ID in our database
    return {
      razorpayOrder,
      message: 'Order created successfully',
      orders: createdOrders,
      totalAmount: grandTotal,
      razorpayAmount: razorpayAmount,
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
     console.log('Customer orders:', result.rows);
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
        u.email AS customer_email,
        p.return_window_days AS return_window_days
      FROM public.orders o
      LEFT JOIN public.users u ON u.id = o.customer_id
      LEFT JOIN public.products p ON p.id = o.product_id
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
        u.email AS customer_email,
        v.business_name AS vendor_name,
        p.return_window_days AS return_window_days
      FROM public.orders o
      LEFT JOIN public.users u ON u.id = o.customer_id
      LEFT JOIN public.vendors v ON v.id = o.vendor_id
      LEFT JOIN public.products p ON p.id = o.product_id
      ORDER BY o.created_at DESC
      `,
    );

    return result.rows;
  }

  // =========================================
  // GET ORDER DETAILS
  // GET /orders/:id
  // =========================================

  async getOrderDetails(orderId, user) {
    const parsedOrderId = Number(orderId);

    if (!orderId || !Number.isInteger(parsedOrderId) || parsedOrderId <= 0) {
      throw new BadRequestException('Valid order ID is required');
    }

    if (!user?.id || !user?.role) {
      throw new ForbiddenException('You are not allowed to view this order');
    }

    const role = String(user.role).toLowerCase();
    if (!['customer', 'vendor', 'admin', 'superadmin'].includes(role)) {
      throw new ForbiddenException('You are not allowed to view this order');
    }

    try {
      const result = await this.databaseService.query(
        `
        SELECT
          o.*,
          customer.id AS customer_id,
          customer.name AS customer_name,
          customer.email AS customer_email,
          vendor.id AS vendor_id,
          vendor.user_id AS vendor_user_id,
          vendor.business_name AS vendor_business_name,
          product.id AS product_id,
          product.name AS product_name,
          product.description AS product_description,
          product.price AS product_price,
          product.return_window_days AS return_window_days
        FROM public.orders o
        LEFT JOIN public.users customer ON customer.id = o.customer_id
        LEFT JOIN public.vendors vendor ON vendor.id = o.vendor_id
        LEFT JOIN public.products product ON product.id = o.product_id
        WHERE o.id = $1
          AND (
            $3 IN ('admin', 'superadmin')
            OR ($3 = 'customer' AND o.customer_id = $2)
            OR ($3 = 'vendor' AND vendor.user_id = $2)
          )
        LIMIT 1
        `,
        [parsedOrderId, Number(user.id), role],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException('Order not found');
      }

      return result.rows[0];
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('Failed to load order details:', error);
      throw new ServiceUnavailableException(
        'Unable to load order details at this time',
      );
    }
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
