const { Module } = require('@nestjs/common');
const { CustomerController } = require('./customer.controller');
const { CustomerService } = require('./customer.service');
class CustomerModule {}

Module({
  controllers: [CustomerController],
  providers: [CustomerService],
})(CustomerModule);

module.exports = { CustomerModule };
