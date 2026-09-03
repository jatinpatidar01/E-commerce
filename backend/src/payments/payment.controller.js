const { Controller, Post, Body } = require('@nestjs/common');

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
}

Controller('payments')(PaymentsController);

Post('create-order')(
  PaymentsController.prototype,
  'createOrder',
  Object.getOwnPropertyDescriptor(PaymentsController.prototype, 'createOrder'),
);

Body()(PaymentsController.prototype, 'createOrder', 0);

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
