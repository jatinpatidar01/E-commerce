const { Injectable } = require('@nestjs/common');
const { DatabaseService } = require('../database/database.service');

const DEFAULT_CATEGORIES = [
  'Shoes',
  'Clothing',
  'Electronics',
  'Mobiles',
  'Laptops',
  'Accessories',
  'Home & Kitchen',
  'Beauty & Personal Care',
];

class CategoriesService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  async getAllCategories() {
    let result = await this.databaseService.query(
      `SELECT id, name, created_at FROM public.categories ORDER BY id ASC`,
    );

    // Auto-seed default categories if table is empty
    if (result.rows.length === 0) {
      for (const name of DEFAULT_CATEGORIES) {
        await this.databaseService.query(
          `INSERT INTO public.categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
          [name],
        );
      }
      result = await this.databaseService.query(
        `SELECT id, name, created_at FROM public.categories ORDER BY id ASC`,
      );
    }

    return result.rows;
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], CategoriesService);
Injectable()(CategoriesService);

module.exports = { CategoriesService };