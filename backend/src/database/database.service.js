const { Injectable } = require('@nestjs/common');
const { Pool } = require('pg');

class DatabaseService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

Injectable()(DatabaseService);



const databaseService = new DatabaseService();

module.exports = {
  DatabaseService,
  databaseService,
};