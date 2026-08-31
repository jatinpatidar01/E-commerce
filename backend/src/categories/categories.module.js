const { Module } = require('@nestjs/common');
const { CategoriesController } = require('./categories.controller');
const { CategoriesService } = require('./categories.service');
const { DatabaseModule } = require('../database/database.module');
const { DatabaseService } = require('../database/database.service');

class CategoriesModule {}

Module({
  imports: [DatabaseModule],
  controllers: [CategoriesController],
  providers: [CategoriesService, DatabaseService],
  exports: [CategoriesService],
})(CategoriesModule);

module.exports = {
  CategoriesModule,
};
