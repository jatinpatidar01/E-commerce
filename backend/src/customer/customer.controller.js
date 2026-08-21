const {
  Controller,
  Get,
} = require("@nestjs/common");

class CustomerController {

  getCustomers() {
    return {
      message: "Customers",
    };
  }
}

const descriptor = Object.getOwnPropertyDescriptor(
  CustomerController.prototype,
  "getCustomers"
);

Get()(CustomerController.prototype, "getCustomers", descriptor);

Controller("customer")(CustomerController);

module.exports = {
  CustomerController,
};