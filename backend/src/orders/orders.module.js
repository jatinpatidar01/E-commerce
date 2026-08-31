const { Module } = require('@nestjs/common');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');
const { OrdersService } = require('./orders.service');
const { OrdersController } = require('./orders.controller');

class OrdersModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})(OrdersModule);

module.exports = {
  OrdersModule,
};
