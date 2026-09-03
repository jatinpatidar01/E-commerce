const {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} = require('@nestjs/common');
const { DatabaseService } = require('../database/database.service');

class AdminService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // =========================================
  // GET ADMIN DASHBOARD STATS
  // =========================================

  async getDashboard() {
    const [
      productsCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      vendorsCount,
      customersCount,
      ordersCount,
    ] = await Promise.all([
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.products`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.products WHERE approval_status = 'pending'`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.products WHERE approval_status = 'approved'`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.products WHERE approval_status = 'rejected'`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.vendors`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.users WHERE role = 'customer'`,
      ),
      this.databaseService.query(
        `SELECT COUNT(*)::INTEGER AS total FROM public.orders`,
      ),
    ]);

    const recentPending = await this.databaseService.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        p.approval_status,
        p.created_at,
        c.name AS category_name,
        v.business_name AS vendor_name
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      LEFT JOIN public.vendors v ON v.id = p.vendor_id
      WHERE p.approval_status = 'pending'
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    return {
      statistics: {
        totalProducts: productsCount.rows[0]?.total || 0,
        pendingProducts: pendingCount.rows[0]?.total || 0,
        approvedProducts: approvedCount.rows[0]?.total || 0,
        rejectedProducts: rejectedCount.rows[0]?.total || 0,
        totalVendors: vendorsCount.rows[0]?.total || 0,
        totalCustomers: customersCount.rows[0]?.total || 0,
        totalOrders: ordersCount.rows[0]?.total || 0,
      },
      recentPendingProducts: recentPending.rows,
    };
  }

  // =========================================
  // GET ALL PRODUCTS WITH FILTERS
  // =========================================

  async getAllProducts(query = {}) {
    const { status, category_id, search } = query;
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    if (status && status !== 'all') {
      conditions.push(`p.approval_status = $${paramIndex++}`);
      params.push(status);
    }

    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      params.push(Number(category_id));
    }

    if (search && search.trim()) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`,
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await this.databaseService.query(
      `
      SELECT
        p.id,
        p.vendor_id,
        v.business_name AS vendor_name,
        p.category_id,
        c.name AS category_name,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.approval_status,
        p.approved_by,
        p.approved_at,
        p.is_active,
        p.created_at,
        p.updated_at
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      LEFT JOIN public.vendors v ON v.id = p.vendor_id
      ${whereClause}
      ORDER BY
        CASE WHEN p.approval_status = 'pending' THEN 1 ELSE 2 END,
        p.created_at DESC
    `,
      params,
    );

    return result.rows;
  }

  async getCustomers() {
    const result = await this.databaseService.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        COUNT(o.id)::INTEGER AS orders_count,
        COALESCE(SUM(o.total_amount), 0)::NUMERIC AS total_spent
      FROM public.users u
      LEFT JOIN public.orders o ON o.customer_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

    return result.rows;
  }

  async getVendors() {
    const result = await this.databaseService.query(`
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        u.role,
        u.created_at,
        v.id AS vendor_id,
        v.business_name,
        COUNT(p.id)::INTEGER AS products_count,
        COUNT(CASE WHEN p.approval_status = 'approved' THEN 1 END)::INTEGER AS approved_products
      FROM public.users u
      INNER JOIN public.vendors v ON v.user_id = u.id
      LEFT JOIN public.products p ON p.vendor_id = v.id
      WHERE u.role = 'vendor'
      GROUP BY u.id, u.name, u.email, u.role, u.created_at, v.id, v.business_name
      ORDER BY u.created_at DESC
    `);

    return result.rows;
  }

  async deleteCustomer(userId) {
    const id = Number(userId);
    const ordersResult = await this.databaseService.query(
      `SELECT COUNT(*)::INTEGER AS total FROM public.orders WHERE customer_id = $1`,
      [id],
    );

    if (ordersResult.rows[0]?.total > 0) {
      throw new ConflictException(
        'This customer cannot be deleted because their order history must be preserved.',
      );
    }

    await this.databaseService.query(
      `DELETE FROM public.cart_items WHERE user_id = $1`,
      [id],
    );

    const result = await this.databaseService.query(
      `DELETE FROM public.users WHERE id = $1 AND role = 'customer' RETURNING id`,
      [id],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Customer not found');
    }

    return { message: 'Customer account deleted successfully' };
  }

  async deleteVendor(userId) {
    const result = await this.databaseService.query(
      `DELETE FROM public.users WHERE id = $1 AND role = 'vendor' RETURNING id`,
      [Number(userId)],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Vendor not found');
    }

    return { message: 'Vendor account deleted successfully' };
  }

  // =========================================
  // APPROVE OR REJECT PRODUCT
  // =========================================

  async updateProductApproval(productId, status, adminUserId) {
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      throw new BadRequestException(
        "Status must be 'approved', 'rejected', or 'pending'",
      );
    }

    const approvedAt = status === 'approved' ? new Date() : null;
    const prodId = Number(productId);
    const adminId = adminUserId ? Number(adminUserId) : null;

    const result = await this.databaseService.query(
      `
      UPDATE public.products
      SET
        approval_status = $1,
        approved_by = $2,
        approved_at = $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `,
      [status, adminId, approvedAt, prodId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.rows[0];
  }

  // =========================================
  // TOGGLE PRODUCT ACTIVE STATUS
  // =========================================

  async toggleProductStatus(productId, isActive) {
    const prodId = Number(productId);
    const result = await this.databaseService.query(
      `
      UPDATE public.products
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `,
      [Boolean(isActive), prodId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.rows[0];
  }

  // =========================================
  // DELETE PRODUCT
  // =========================================

  async deleteProduct(productId) {
    const prodId = Number(productId);
    const result = await this.databaseService.query(
      `
      DELETE FROM public.products WHERE id = $1 RETURNING id
    `,
      [prodId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], AdminService);
Injectable()(AdminService);

module.exports = { AdminService };
