const { Injectable } = require("@nestjs/common");
const { Pool } = require("pg");

class DatabaseService {
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured");
    }

    this.pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 15000,
      statement_timeout: 5000,
      ssl: /neon|postgres|supabase|render|railway/i.test(connectionString)
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  async onModuleInit() {
    try {
      await this.pool.query("SELECT 1");
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error.message);
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
};