const { Controller, Post, Req, Headers } = require('@nestjs/common');

const {
  RazorpayWebhookService,
} = require('./razorpay-webhook.service');

class RazorpayWebhookController {
  constructor(razorpayWebhookService) {
    this.razorpayWebhookService = razorpayWebhookService;
  }

  @Post('/payments/webhook')
  async handleWebhook(req, headers) {
    const signature = headers['x-razorpay-signature'];

    return this.razorpayWebhookService.handleWebhook(
      req.rawBody,
      signature,
    );
  }
}

module.exports = {
  RazorpayWebhookController,
};