const { Injectable } = require('@nestjs/common');
const { Pool } = require('pg');

function getPgSslConfig(connectionString) {
  if (!connectionString) {
    return undefined;
  }

  const url = connectionString.toLowerCase();

  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('::1')) {
    return false;
  }

  if (url.includes('sslmode=require') || url.includes('sslmode=prefer') || url.includes('sslmode=verify-full')) {
    return { rejectUnauthorized: false };
  }

  if (/neon|supabase|render|railway/i.test(connectionString)) {
    return { rejectUnauthorized: false };
  }

  return undefined;
}

class DatabaseService {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not configured');
    }

    this.pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      statement_timeout: 5000,
      ssl: getPgSslConfig(connectionString),
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }
  }

  async query(text, params) {
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}

Injectable()(DatabaseService);

module.exports = {
  DatabaseService,
  getPgSslConfig,
};
