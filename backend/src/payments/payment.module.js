const { Module } = require('@nestjs/common');

const { PaymentsController } = require('./payment.controller');

const { PaymentsService } = require('./payment.service');

// const { RazorpayService } = require('./razorpay.service');

const { DatabaseService } = require('../database/database.service');
const { AuthModule } = require('../auth/auth.module');

class PaymentsModule {}

Module({
  imports: [AuthModule],
  controllers: [PaymentsController],

  providers: [PaymentsService, DatabaseService],

  exports: [PaymentsService],
})(PaymentsModule);

module.exports = {
  PaymentsModule,
};
