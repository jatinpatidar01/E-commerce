const { Module } = require('@nestjs/common');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');
const { CartService } = require('./cart.service');
const { CartController } = require('./cart.controller');

class CartModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})(CartModule);

module.exports = { CartModule };
