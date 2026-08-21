const { Module } = require('@nestjs/common');

class VendorModule {}

Module({})(VendorModule);

module.exports = { VendorModule };