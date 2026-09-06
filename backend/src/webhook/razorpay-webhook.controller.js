const { Controller, Post, Req, Headers } = require('@nestjs/common');

const { RazorpayWebhookService } = require('./razorpay-webhook.service');

class RazorpayWebhookController {
  constructor(razorpayWebhookService) {
    this.razorpayWebhookService = razorpayWebhookService;
  }

  async razorpayWebhook(req, headers) {
    console.log('Received Razorpay webhook:', req.body);

    const signature = headers['x-razorpay-signature'];
    const rawBody = req.rawBody;

    return this.razorpayWebhookService.handleWebhook(rawBody, signature);
  }
}

Controller('webhook')(RazorpayWebhookController);

Post('razorpay')(
  RazorpayWebhookController.prototype,
  'razorpayWebhook',
  Object.getOwnPropertyDescriptor(
    RazorpayWebhookController.prototype,
    'razorpayWebhook',
  ),
);

Req()(RazorpayWebhookController.prototype, 'razorpayWebhook', 0);

Headers()(RazorpayWebhookController.prototype, 'razorpayWebhook', 1);

Reflect.defineMetadata(
  'design:paramtypes',
  [RazorpayWebhookService],
  RazorpayWebhookController,
);
module.exports = {
  RazorpayWebhookController,
};
