const { Module } = require('@nestjs/common');

const { DatabaseService } = require('./database.service');

class DatabaseModule {}

Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})(DatabaseModule);

module.exports = {
  DatabaseModule,
};