const { Module } = require('@nestjs/common');

const { AuthController } = require('./auth.controller');
const { AuthService } = require('./auth.service');
const { DatabaseModule } = require('../database/database.module');

class AuthModule {}

Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [AuthService],
})(AuthModule);

module.exports = {
  AuthModule,
};
