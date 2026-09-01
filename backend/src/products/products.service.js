const {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} = require('@nestjs/common');

const { DatabaseService } = require('../database/database.service');

class ProductsService {
  constructor(databaseService) {
    this.databaseService = databaseService;
  }

  // GET PUBLIC PRODUCTS (FOR CUSTOMERS)

  async getPublicProducts(query = {}) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(query.limit, 10) || 9));
    const offset = (page - 1) * limit;

    const { category, category_id, search, minPrice, maxPrice, sort } = query;

    const conditions = ['p.is_active = true', "p.approval_status = 'approved'"];
    const params = [];
    let paramIndex = 1;

    if (category_id) {
      conditions.push(`p.category_id = $${paramIndex++}`);
      params.push(Number(category_id));
    } else if (
      category &&
      category.trim() &&
      category.toLowerCase() !== 'all' &&
      category.toLowerCase() !== 'all categories'
    ) {
      conditions.push(`LOWER(c.name) = LOWER($${paramIndex++})`);
      params.push(category.trim());
    }

    if (search && search.trim()) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`,
      );
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (minPrice !== undefined && minPrice !== '') {
      conditions.push(`p.price >= $${paramIndex++}`);
      params.push(Number(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push(`p.price <= $${paramIndex++}`);
      params.push(Number(maxPrice));
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    let orderBy = 'ORDER BY p.created_at DESC';
    if (sort === 'price_asc') {
      orderBy = 'ORDER BY p.price ASC';
    } else if (sort === 'price_desc') {
      orderBy = 'ORDER BY p.price DESC';
    }

    // Total Count
    const countQuery = `
      SELECT COUNT(*)::INTEGER AS total
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      ${whereClause}
    `;
    const countResult = await this.databaseService.query(countQuery, params);
    const total = countResult.rows[0]?.total || 0;

    // Paginated Data
    const dataQuery = `
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
        p.is_active,
        p.created_at,
        p.updated_at
      FROM public.products p
      LEFT JOIN public.categories c ON c.id = p.category_id
      LEFT JOIN public.vendors v ON v.id = p.vendor_id
      ${whereClause}
      ${orderBy}
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    const dataParams = [...params, limit, offset];
    const dataResult = await this.databaseService.query(dataQuery, dataParams);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  // =========================================
  // GET VENDOR ID
  // =========================================

  async getVendorId(userId) {
    let result = await this.databaseService.query(
      `
        SELECT id
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

        if (user.role !== 'vendor' && user.role !== 'superadmin') {
          throw new ForbiddenException(
            'Access denied. Only registered vendor accounts can manage products.',
          );
        }

        const userName = user.name || 'Vendor';

        const insertRes = await this.databaseService.query(
          `INSERT INTO public.vendors (user_id, business_name) VALUES ($1, $2) RETURNING id`,
          [userId, `${userName}'s Business`],
        );
        return insertRes.rows[0].id;
      }

      throw new NotFoundException('Vendor profile not found');
    }

    return result.rows[0].id;
  }

  // =========================================
  // GET VENDOR PRODUCTS
  // =========================================

  async getVendorProducts(userId) {
    const vendorId = await this.getVendorId(userId);

    const result = await this.databaseService.query(
      `
        SELECT
          p.id,
          p.vendor_id,
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
        WHERE p.vendor_id = $1
        ORDER BY p.created_at DESC
        `,
      [vendorId],
    );

    return result.rows;
  }

  // =========================================
  // GET SINGLE PRODUCT (PUBLIC / VENDOR)
  // =========================================

  async getProduct(productId, vendorUserId = null) {
    let query;
    let params;

    if (vendorUserId) {
      const vendorId = await this.getVendorId(vendorUserId);
      query = `
        SELECT
          p.id,
          p.vendor_id,
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
        WHERE p.id = $1
        AND p.vendor_id = $2
        LIMIT 1
      `;
      params = [productId, vendorId];
    } else {
      query = `
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
          p.is_active,
          p.created_at,
          p.updated_at
        FROM public.products p
        LEFT JOIN public.categories c ON c.id = p.category_id
        LEFT JOIN public.vendors v ON v.id = p.vendor_id
        WHERE p.id = $1
        LIMIT 1
      `;
      params = [productId];
    }

    const result = await this.databaseService.query(query, params);

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.rows[0];
  }

  // CREATE PRODUCT

  async createProduct(userId, data) {
    const vendorId = await this.getVendorId(userId);

    const { name, description, category_id, price, stock } = data;

    const result = await this.databaseService.query(
      `
        INSERT INTO public.products
        (
          vendor_id,
          category_id,
          name,
          description,
          price,
          stock,
          approval_status,
          is_active
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4, 
          $5,
          $6,
          'pending',
          true
        )
        RETURNING *
        `,
      [vendorId, category_id, name, description || '', price, stock || 0],
    );

    return result.rows[0];
  }

  async updateProduct(userId, productId, data) {
    const vendorId = await this.getVendorId(userId);

    const { name, description, category_id, price, stock } = data;

    const result = await this.databaseService.query(
      `
        UPDATE public.products
        SET
          name = COALESCE($1, name),
          description = COALESCE($2, description),
          category_id = COALESCE($3, category_id),
          price = COALESCE($4, price),
          stock = COALESCE($5, stock),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        AND vendor_id = $7
        RETURNING *
        `,
      [
        name ?? null,
        description ?? null,
        category_id ?? null,
        price ?? null,
        stock ?? null,
        productId,
        vendorId,
      ],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.rows[0];
  }

  // DELETE PRODUCT

  async deleteProduct(userId, productId) {
    const vendorId = await this.getVendorId(userId);

    const result = await this.databaseService.query(
      `
        DELETE FROM public.products
        WHERE id = $1
        AND vendor_id = $2
        RETURNING id
        `,
      [productId, vendorId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product deleted successfully',
    };
  }
  // ACTIVATE / DEACTIVATE

  async toggleProductStatus(userId, productId, isActive) {
    const vendorId = await this.getVendorId(userId);

    const result = await this.databaseService.query(
      `
        UPDATE public.products
        SET
          is_active = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        AND vendor_id = $3
        RETURNING *
        `,
      [isActive, productId, vendorId],
    );

    if (result.rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return result.rows[0];
  }

  // ADMIN: APPROVE / REJECT PRODUCT

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
}

Reflect.defineMetadata('design:paramtypes', [DatabaseService], ProductsService);

Injectable()(ProductsService);

module.exports = {
  ProductsService,
};
