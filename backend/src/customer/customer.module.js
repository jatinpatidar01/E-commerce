const { Module } = require('@nestjs/common');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');
const { CustomerController } = require('./customer.controller');
const { CustomerService } = require('./customer.service');

class CustomerModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CustomerController],
  providers: [CustomerService],
  exports: [CustomerService],
})(CustomerModule);

module.exports = { CustomerModule };
