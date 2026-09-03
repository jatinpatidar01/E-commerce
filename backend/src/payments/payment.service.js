const { Injectable } = require('@nestjs/common');
const Razorpay = require('razorpay');

class PaymentsService {
  constructor() {
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

  async refundPayment(paymentId, amount) {
  const refund = await this.razorpay.payments.refund(paymentId, {
    amount: amount * 100,
  });

  return refund;
}
Injectable()(PaymentsService);

module.exports = {
  PaymentsService       ,
};
