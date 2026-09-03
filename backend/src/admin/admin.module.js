const { Module } = require('@nestjs/common');
const { DatabaseModule } = require('../database/database.module');
const { AuthModule } = require('../auth/auth.module');
const { AdminService } = require('./admin.service');
const { AdminController } = require('./admin.controller');

class AdminModule {}

Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})(AdminModule);

module.exports = { AdminModule };
