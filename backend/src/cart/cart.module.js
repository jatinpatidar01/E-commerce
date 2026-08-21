const { Module } = require('@nestjs/common');

class CartModule {}

Module({})(CartModule);

module.exports = { CartModule };