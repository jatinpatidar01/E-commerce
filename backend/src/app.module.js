const { Module } = require('@nestjs/common');

const { AuthModule } = require('./auth/auth.module');
const { AdminModule } = require('./admin/admin.module');
const { CustomerModule } = require('./customer/customer.module');
const { VendorModule } = require('./vendor/vendor.module');
const { ProductsModule } = require('./products/products.module');
const { CategoriesModule } = require('./categories/categories.module');
const { CartModule } = require('./cart/cart.module');
const { OrdersModule } = require('./orders/orders.module');
const { DatabaseModule } = require('./database/database.module');
const { AppController } = require('./app.controller');
const { PaymentsModule} = require('./payments/payment.module');
const { RazorpayWebhookModule } = require('./webhook/razorpay-webhook.module');

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
    DatabaseModule,
    PaymentsModule,
    RazorpayWebhookModule,

  ],
})(AppModule);

module.exports = { AppModule };
