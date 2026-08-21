const { Module } = require('@nestjs/common');

const { AuthModule } = require('./auth/auth.module');
const { AdminModule } = require('./admin/admin.module');
const { CustomerModule } = require('./customer/customer.module');
const { VendorModule } = require('./vendor/vendor.module');
const { ProductsModule } = require('./products/products.module');
const { CategoriesModule } = require('./categories/categories.module');
const { CartModule } = require('./cart/cart.module');
const { OrdersModule } = require('./orders/orders.module');
const { PaymentsModule } = require('./payments/payments.module');
const { NotificationsModule } = require('./notifications/notifications.module');
const { DatabaseModule } = require('./database/database.module');
const { AppController } = require('./app.controller');
class AppModule {}

Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    AdminModule,
    CustomerModule,
    VendorModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    DatabaseModule,
  ],
})(AppModule);

module.exports = { AppModule };
