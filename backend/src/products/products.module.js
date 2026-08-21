const { Module } = require('@nestjs/common');

class ProductsModule {}

Module({})(ProductsModule);

module.exports = { ProductsModule };