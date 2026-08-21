const { DatabaseService } = require("../database/database.service");
const {
  databaseService,
} = require("../database/database.service");
async function getOrders(page = 1, limit = 9) {
  try {
    const offset = (page - 1) * limit;

    console.log(
      `Fetching orders for page ${page} with limit ${limit} (offset: ${offset})`
    );

    // Total orders
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM orders
    `;

    console.log("Running count query...");

    const countResult = await databaseService.query(
      countQuery
    );

    console.log("Count result:", countResult.rows);

    const total = Number(countResult.rows[0].total);

    // Paginated orders
    const query = `
      SELECT *
      FROM orders
      ORDER BY created_at DESC
      LIMIT $1
      OFFSET $2
    `;

    console.log("Running orders query...");

    const result = await databaseService.query(query, [
      limit,
      offset,
    ]);

    console.log("Orders result:", result.rows);

    return {
      orders: result.rows,

      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("❌ Error in getOrders():");
    console.error(error);

    throw error;
  }
}

module.exports = {
  getOrders,
};