const {
  Controller,
  Get,
} = require("@nestjs/common");

const ordersService = require("./orders.service");

class OrdersController {
  getOrders(page = 1) {
    return ordersService.getOrders(page, 9);
  }
}

const descriptor = Object.getOwnPropertyDescriptor(
  OrdersController.prototype,
  "getOrders"
);

Get()(OrdersController.prototype, "getOrders", descriptor);

Controller("orders")(OrdersController);

module.exports = {
  OrdersController,
};