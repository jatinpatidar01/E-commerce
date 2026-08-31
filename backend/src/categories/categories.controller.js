const { Controller, Get } = require('@nestjs/common');
const { CategoriesService } = require('./categories.service');

class CategoriesController {
  constructor(categoriesService) {
    this.categoriesService = categoriesService;
  }

  getCategories() {
    return this.categoriesService.getAllCategories();
  }
}

Controller('categories')(CategoriesController);

Get()(
  CategoriesController.prototype,
  'getCategories',
  Object.getOwnPropertyDescriptor(
    CategoriesController.prototype,
    'getCategories',
  ),
);

Reflect.defineMetadata(
  'design:paramtypes',
  [CategoriesService],
  CategoriesController,
);

module.exports = {
  CategoriesController,
};
