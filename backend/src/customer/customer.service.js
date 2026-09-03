const {
  Injectable,
  NotFoundException,
  BadRequestException,
} = require('@nestjs/common');
const bcrypt = require('bcrypt');
const { DatabaseService } = require('../database/database.service');

class CustomerService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // =========================================
  // GET CUSTOMER PROFILE & STATS
  // GET /customer/profile
  // =========================================

  async getProfile(userId) {
    const userRes = await this.databaseService.query(
      `
      SELECT id, name, email, role, created_at
      FROM public.users
      WHERE id = $1
      LIMIT 1
      `,
      [userId],
    );

    if (userRes.rows.length === 0) {
      throw new NotFoundException('User profile not found');
    }

    const user = userRes.rows[0];

    // Stats
    const [ordersCountRes, spentRes, cartCountRes, recentOrdersRes] =
      await Promise.all([
        this.databaseService.query(
          `SELECT COUNT(*)::INTEGER AS total, COUNT(CASE WHEN status IN ('pending', 'confirmed', 'shipped') THEN 1 END)::INTEGER AS in_progress FROM public.orders WHERE customer_id = $1`,
          [userId],
        ),
        this.databaseService.query(
          `SELECT COALESCE(SUM(total_amount), 0)::NUMERIC AS total_spent FROM public.orders WHERE customer_id = $1 AND status != 'cancelled'`,
          [userId],
        ),
        this.databaseService.query(
          `SELECT COALESCE(SUM(quantity), 0)::INTEGER AS total_cart_items FROM public.cart_items WHERE user_id = $1`,
          [userId],
        ),
        this.databaseService.query(
          `SELECT id, product_name, total_amount, status, created_at FROM public.orders WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 3`,
          [userId],
        ),
      ]);

    return {
      user,
      stats: {
        totalOrders: ordersCountRes.rows[0]?.total || 0,
        inProgressOrders: ordersCountRes.rows[0]?.in_progress || 0,
        totalSpent: Number(spentRes.rows[0]?.total_spent || 0),
        cartItemsCount: cartCountRes.rows[0]?.total_cart_items || 0,
      },
      recentOrders: recentOrdersRes.rows,
    };
  }

  // =========================================
  // UPDATE CUSTOMER PROFILE
  // PATCH /customer/profile
  // =========================================

  async updateProfile(userId, data) {
    const { name, email, newPassword } = data || {};

    const userRes = await this.databaseService.query(
      `SELECT id FROM public.users WHERE id = $1 LIMIT 1`,
      [userId],
    );

    if (userRes.rows.length === 0) {
      throw new NotFoundException('User not found');
    }

    const updates = [];
    const params = [];
    let paramIndex = 1;

    if (name && name.trim()) {
      updates.push(`name = $${paramIndex++}`);
      params.push(name.trim());
    }

    if (email && email.trim()) {
      const cleanedEmail = email.trim().toLowerCase();
      // Check if email taken by someone else
      const emailCheck = await this.databaseService.query(
        `SELECT id FROM public.users WHERE LOWER(email) = $1 AND id != $2 LIMIT 1`,
        [cleanedEmail, userId],
      );
      if (emailCheck.rows.length > 0) {
        throw new BadRequestException(
          'This email is already registered to another account.',
        );
      }
      updates.push(`email = $${paramIndex++}`);
      params.push(cleanedEmail);
    }

    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 3) {
        throw new BadRequestException(
          'New password must be at least 3 characters.',
        );
      }
      const hashed = await bcrypt.hash(newPassword.trim(), 10);
      updates.push(`password = $${paramIndex++}`);
      params.push(hashed);
    }

    if (updates.length === 0) {
      return this.getProfile(userId);
    }

    params.push(userId);

    const updateQuery = `
      UPDATE public.users
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, name, email, role, created_at
    `;

    await this.databaseService.query(updateQuery, params);

    return this.getProfile(userId);
  }
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], CustomerService);
Injectable()(CustomerService);

module.exports = { CustomerService };
