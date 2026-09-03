const { Module } = require('@nestjs/common');

const { PaymentsController } = require('./payment.controller');

const { PaymentsService } = require('./payment.service');

// const { RazorpayService } = require('./razorpay.service');

const { DatabaseService } = require('../database/database.service');

class PaymentsModule {}

Module({
  controllers: [PaymentsController],

  providers: [PaymentsService, DatabaseService],

  exports: [PaymentsService],
})(PaymentsModule);

module.exports = {
  PaymentsModule,
};
