const {
  Injectable,
  BadRequestException,
  NotFoundException,
} = require('@nestjs/common');
const Razorpay = require('razorpay');
const { DatabaseService } = require('../database/database.service');

class PaymentsService {
  constructor(databaseService) {
    this.databaseService = databaseService;
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(amount) {
    const order = await this.razorpay.orders.create({
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });
    return order;
  }

  async refundPayment(orderId, customerId) {
    if (!orderId) {
      throw new BadRequestException('Order ID is required');
    }
    console.log('Order ID is required');  

    const orderResult = await this.databaseService.query(
      `
    SELECT
      o.razorpay_payment_id,
      o.total_amount,
      o.payment_status,
      o.payment_confirmed_at,
      o.product_id,
      p.return_window_days
    FROM public.orders o
    LEFT JOIN public.products p
      ON p.id = o.product_id
    WHERE o.id = $1
      AND o.customer_id = $2
    LIMIT 1
    `,
      [orderId, customerId],
    );

    if (orderResult.rows.length === 0) {
      console.log('Order not found');
      throw new NotFoundException('Order not found');
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'refunded') {
      console.log('Order has already been refunded');
      throw new BadRequestException('Order has already been refunded');
    }

    if (order.payment_status !== 'paid' || !order.razorpay_payment_id) {
      console.log('Order is not eligible for a refund');
      throw new BadRequestException('Order is not eligible for a refund');
    }

    // Check refund window
    if (!order.payment_confirmed_at) {
      console.log('Payment confirmation date is missing');
      throw new BadRequestException('Payment confirmation date is missing');
    }

    if (!order.return_window_days) {
      console.log('Return window is not configured for this product');
      throw new BadRequestException(
        'Return window is not configured for this product',
      );
    }

    const paymentConfirmedAt = new Date(order.payment_confirmed_at);

    const refundDeadline = new Date(paymentConfirmedAt);
    refundDeadline.setDate(
      refundDeadline.getDate() + Number(order.return_window_days),
    );

    if (new Date() > refundDeadline) {
      throw new BadRequestException('Refund window has expired');
    }

    // Refund amount
    const refundAmount = 1;

    const refund = await this.razorpay.payments.refund(
      order.razorpay_payment_id,
      {
        amount: Number(refundAmount) * 100,
      },
    );

    console.log('Refund response from Razorpay:', refund);

    await this.databaseService.query(
      `
    UPDATE public.orders
    SET
      refund_status = 'processing',
      razorpay_refund_id = $1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
      AND customer_id = $3
    `,
      [refund.id, orderId, customerId],
    );

    return {
      message: 'Refund processed successfully',
      refund,
    };
  }
}
Reflect.defineMetadata('design:paramtypes', [DatabaseService], PaymentsService);
Injectable()(PaymentsService);

module.exports = {
  PaymentsService,
};
