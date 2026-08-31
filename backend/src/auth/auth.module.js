const { Module } = require('@nestjs/common');

const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');
const { JwtAuthGuard } = require('./guards/jwt-auth.guard');
const { RolesGuard } = require('./guards/roles.guard');
const { DatabaseModule } = require('../database/database.module');

class AuthModule {}

Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})(AuthModule);

module.exports = {
  AuthModule,
};
