const {
  Injectable,
  BadRequestException,
  NotFoundException,
} = require('@nestjs/common');

const crypto = require('crypto');
const { DatabaseService } = require('../database/database.service');

class RazorpayWebhookService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async handleWebhook(rawBody, signature) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      throw new BadRequestException(
        'Razorpay webhook secret is not configured',
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = JSON.parse(rawBody);

    console.log('Razorpay webhook event:', event.event);

    if (event.event === 'payment.captured') {
      await this.handlePaymentCaptured(event);
    }
    if (event.event === 'refund.created') {
      await this.handleRefundCreated(event);
    }

    if (event.event === 'refund.processed') {
      await this.handleRefundProcessed(event);
    }

    if (event.event === 'refund.failed') {
      await this.handleRefundFailed(event);
    }
    if (event.event === 'payment.failed') {
      await this.handlePaymentFailed(event);
    }

    return {
      received: true,
    };
  }
  async handlePaymentCaptured(event) {
    const payment = event.payload.payment.entity;

    const razorpayOrderId = payment.order_id;
    const razorpayPaymentId = payment.id;

    const orderRes = await this.databaseService.query(
      `
    SELECT customer_id, product_id
    FROM public.orders
    WHERE razorpay_order_id = $1
    `,
      [razorpayOrderId],
    );

    if (orderRes.rows.length === 0) {
      throw new NotFoundException('Order not found');
    }

    const customerId = orderRes.rows[0].customer_id;
    const productIds = orderRes.rows.map((order) => order.product_id);

    await this.databaseService.query(
      `
    DELETE FROM public.cart_items
    WHERE user_id = $1
    AND product_id = ANY($2)
    `,
      [customerId, productIds],
    );

    await this.databaseService.query(
      `
    UPDATE public.orders
    SET
      status = 'confirmed',
      payment_status = 'paid',
      razorpay_payment_id = $1,
      payment_confirmed_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE razorpay_order_id = $2
    `,
      [razorpayPaymentId, razorpayOrderId],
    );
    await this.databaseService.query(
      `
  UPDATE public.products p
  SET stock_quantity = p.stock_quantity - o.quantity
  FROM public.orders o
  WHERE p.id = o.product_id
    AND o.razorpay_order_id = $1
  `,
      [razorpayOrderId],
    );
  }
  async handlePaymentFailed(event) {
    const payment = event.payload.payment.entity;

    const razorpayOrderId = payment.order_id;

    console.log('Payment failed:', razorpayOrderId);

    await this.databaseService.query(
      `
      UPDATE public.orders
      SET status = 'cancelled',
          updated_at = CURRENT_TIMESTAMP
      WHERE razorpay_order_id = $1
      `,
      [razorpayOrderId],
    );
  }

  async handleRefundCreated(event) {
    const refund = event.payload.refund.entity;
    const refundId = refund.id;

    await this.databaseService.query(
      `
    UPDATE public.orders
    SET
      refund_status = 'requested',
      updated_at = CURRENT_TIMESTAMP
    WHERE razorpay_refund_id = $1
    `,
      [refundId],
    );
  }

  async handleRefundProcessed(event) {
    const refund = event.payload.refund.entity;
    const refundId = refund.id;

    await this.databaseService.query(
      `
    UPDATE public.orders
    SET
      refund_status = 'processed',
      updated_at = CURRENT_TIMESTAMP
    WHERE razorpay_refund_id = $1
    `,
      [refundId],
    );
  }

  async handleRefundFailed(event) {
    const refund = event.payload.refund.entity;
    const refundId = refund.id;

    await this.databaseService.query(
      `
    UPDATE public.orders
    SET
      refund_status = 'failed',
      updated_at = CURRENT_TIMESTAMP
    WHERE razorpay_refund_id = $1
    `,
      [refundId],
    );
  }
}
Reflect.defineMetadata(
  'design:paramtypes',
  [DatabaseService],
  RazorpayWebhookService,
);

Injectable()(RazorpayWebhookService);

module.exports = {
  RazorpayWebhookService,
};
