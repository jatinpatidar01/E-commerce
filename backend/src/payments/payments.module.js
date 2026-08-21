const { Module } = require('@nestjs/common');

class PaymentsModule {}

Module({})(PaymentsModule);

module.exports = { PaymentsModule };