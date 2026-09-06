const {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} = require('@nestjs/common');

const { JwtAuthGuard } = require('../auth/guards/jwt-auth.guard');
const { PaymentsService } = require('./payment.service');

class PaymentsController {
  constructor(paymentsService) {
    this.paymentsService = paymentsService;
  }

  async createOrder(body) {
    return this.paymentsService.createOrder(Number(body.amount));
  }

  async verifyPayment(body) {
    return this.paymentsService.verifyPayment(body);
  }

  async refundPayment(body, req) {
    // console.log('CONTROLLER REQ USER:', req.user);
    // console.log('CONTROLLER BODY:', body);

    if (!body?.orderId) {
      throw new BadRequestException('Order ID is required');
    }

    return this.paymentsService.refundPayment(body.orderId, req.user.id);
  }
}

Controller('payments')(PaymentsController);

 UseGuards(JwtAuthGuard)(PaymentsController);

Reflect.defineMetadata(
  'design:paramtypes',
  [PaymentsService],
  PaymentsController,
);

Post('create-order')(
  PaymentsController.prototype,
  'createOrder',
  Object.getOwnPropertyDescriptor(PaymentsController.prototype, 'createOrder'),
);

Body()(PaymentsController.prototype, 'createOrder', 0);

Post('refund')(
  PaymentsController.prototype,
  'refundPayment',
  Object.getOwnPropertyDescriptor(
    PaymentsController.prototype,
    'refundPayment',
  ),
);

Body()(PaymentsController.prototype, 'refundPayment', 0);

Req()(PaymentsController.prototype, 'refundPayment', 1);



Post('verify')(
  PaymentsController.prototype,
  'verifyPayment',
  Object.getOwnPropertyDescriptor(
    PaymentsController.prototype,
    'verifyPayment',
  ),
);

Body()(PaymentsController.prototype, 'verifyPayment', 0);

module.exports = {
  PaymentsController,
};
