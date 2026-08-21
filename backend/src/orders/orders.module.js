const { Module } = require("@nestjs/common");
const { OrdersController } = require("./orders.controller");
class OrdersModule {}

Module({
  controllers: [OrdersController],
})(OrdersModule);

module.exports = {
  OrdersModule,
};
 
