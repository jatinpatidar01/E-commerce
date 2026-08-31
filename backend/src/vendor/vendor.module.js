const { Module } = require('@nestjs/common');

const { VendorController } = require('./vendor.controller');
const { VendorService } = require('./vendor.service');
const { DatabaseService } = require('../database/database.service');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');

class VendorModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [VendorController],
  providers: [VendorService, DatabaseService],
  exports: [VendorService],
})(VendorModule);

module.exports = {
  VendorModule,
};
