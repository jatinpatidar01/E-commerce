const { Module } = require('@nestjs/common');

const { ProductsController } = require('./products.controller');
const { ProductsService } = require('./products.service');
const { DatabaseService } = require('../database/database.service');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');

class ProductsModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService, DatabaseService],
  exports: [ProductsService],
})(ProductsModule);

module.exports = {
  ProductsModule,
};
