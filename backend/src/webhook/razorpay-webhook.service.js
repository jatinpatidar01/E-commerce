const {
  Injectable,
  BadRequestException,
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

    console.log('Payment captured:', {
      razorpayOrderId,
      razorpayPaymentId,
    });

    // Update your payment/order record here
    await this.databaseService.query(
      `
      UPDATE public.orders
      SET status = 'confirmed',
          updated_at = CURRENT_TIMESTAMP
      WHERE razorpay_order_id = $1
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