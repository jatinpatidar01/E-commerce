const { Module } = require('@nestjs/common');

const { RazorpayWebhookController } = require('./razorpay-webhook.controller');

const { RazorpayWebhookService } = require('./razorpay-webhook.service');

const { DatabaseModule } = require('../database/database.module');

class RazorpayWebhookModule {}

Module({
  imports: [DatabaseModule],
  controllers: [RazorpayWebhookController],
  providers: [RazorpayWebhookService],
  exports: [RazorpayWebhookService],
})(RazorpayWebhookModule);

module.exports = {
  RazorpayWebhookModule,
};
