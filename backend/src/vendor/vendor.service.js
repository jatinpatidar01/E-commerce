const {
  Injectable,
  NotFoundException,
  ForbiddenException,
} = require('@nestjs/common');

const { DatabaseService } = require('../database/database.service');

class VendorService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // =========================================
  // GET VENDOR BY USER ID
  // =========================================

  async getVendorByUserId(userId) {
    const result = await this.databaseService.query(
      `
      SELECT
        id,
        user_id,
        business_name,
        created_at
      FROM public.vendors
      WHERE user_id = $1
      LIMIT 1
      `,
      [userId],
    );

    if (result.rows.length === 0) {
      const userRes = await this.databaseService.query(
        `SELECT name, role FROM public.users WHERE id = $1 LIMIT 1`,
        [userId],
      );

      if (userRes.rows.length > 0) {
        const user = userRes.rows[0];

        // Customer role must NEVER be auto-upgraded or allowed vendor access
        if (user.role !== 'vendor' && user.role !== 'superadmin') {
          throw new ForbiddenException(
            'Access denied. Your account is registered as a Customer. Please register as a Vendor to access vendor features.',
          );
        }

        const userName = user.name || 'Vendor';

        const insertRes = await this.databaseService.query(
          `INSERT INTO public.vendors (user_id, business_name) VALUES ($1, $2) RETURNING id, user_id, business_name, created_at`,
          [userId, `${userName}'s Business`],
        );
        return insertRes.rows[0];
      }

      throw new NotFoundException('Vendor profile not found');
    }

    return result.rows[0];
  }

  // =========================================
  // GET VENDOR PROFILE
  // =========================================

  async getProfile(userId) {
    const vendor = await this.getVendorByUserId(userId);

    const userResult = await this.databaseService.query(
      `
      SELECT name, email, role, created_at
      FROM public.users
      WHERE id = $1
      LIMIT 1
      `,
      [userId],
    );

    const user = userResult.rows[0];

    return {
      id: vendor.id,
      userId: vendor.user_id,
      businessName: vendor.business_name,
      createdAt: vendor.created_at,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at,
      },
    };
  }

  // =========================================
  // UPDATE VENDOR PROFILE
  // =========================================

  async updateProfile(userId, updateData) {
    const { businessName } = updateData;

    const vendor = await this.getVendorByUserId(userId);

    const result = await this.databaseService.query(
      `
      UPDATE public.vendors
      SET business_name = $1
      WHERE id = $2
      RETURNING
        id,
        user_id,
        business_name,
        created_at
      `,
      [businessName, vendor.id],
    );

    return result.rows[0];
  }

  // =========================================
  // GET VENDOR DASHBOARD
  // =========================================

  async getDashboard(userId) {
    const vendor = await this.getVendorByUserId(userId);

    const statsResult = await this.databaseService.query(
      `
      SELECT
        COUNT(*)::INTEGER AS total_products,
        COUNT(CASE WHEN approval_status = 'approved' AND is_active = true THEN 1 END)::INTEGER AS approved_products,
        COUNT(CASE WHEN approval_status = 'pending' THEN 1 END)::INTEGER AS pending_products,
        COUNT(CASE WHEN approval_status = 'rejected' THEN 1 END)::INTEGER AS rejected_products,
        COUNT(CASE WHEN is_active = true THEN 1 END)::INTEGER AS active_products
      FROM public.products
      WHERE vendor_id = $1
      `,
      [vendor.id],
    );

    const recentResult = await this.databaseService.query(
      `
      SELECT
        p.id,
        p.name,
        p.price,
        p.stock,
        p.approval_status,
        p.is_active,
        p.created_at,
        c.name AS category_name
      FROM public.products p
      LEFT JOIN public.categories c
        ON c.id = p.category_id
      WHERE p.vendor_id = $1
      ORDER BY p.created_at DESC
      LIMIT 5
      `,
      [vendor.id],
    );

    const statistics = statsResult.rows[0];

    return {
      vendor,
      statistics: {
        totalProducts: statistics.total_products,
        approvedProducts: statistics.approved_products,
        pendingProducts: statistics.pending_products,
        rejectedProducts: statistics.rejected_products,
        activeProducts: statistics.active_products,
      },
      recentProducts: recentResult.rows,
    };
  }

  // =========================================
  // GET CATEGORIES
  // =========================================

  async getCategories() {
    const result = await this.databaseService.query(
      `
      SELECT
        id,
        name,
        slug
      FROM public.categories
      ORDER BY name ASC
      `,
    );

    return result.rows;
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], VendorService);

Injectable()(VendorService);

module.exports = {
  VendorService,
};
