# E-Commerce Multi-Vendor Platform (Backend)

Progressive Node.js & NestJS backend powering a multi-vendor e-commerce platform with PostgreSQL.

---

## Roles & Hierarchy

```
                         users
                    /      |       \
                   /       |        \
             customer    vendor    superadmin
                |           |
                |           ↓
                |        vendors
                |           |
                |           ↓
                |        products
                |         /     \
                |        ↓       ↓
                |   categories   approval (Admin)
                |               
                ↓
              orders
```

| Role | Permissions |
| --- | --- |
| **`customer`** | Browse approved products, manage cart, place orders, view order history. |
| **`vendor`** | Manage business profile, create products (`pending`), update/delete owned products, track approval status, view store metrics. |
| **`superadmin`** | Review pending products (approve / reject), manage categories, manage users and orders across the platform. |

---

## Product Lifecycle & Workflow

```
[Vendor Creates Product]
          ↓
  status = 'pending'
  is_active = true
          ↓
  [Admin Reviews]
     /         \
    ↓           ↓
[Approved]   [Rejected]
    ↓           ↓
Listed on   Remains hidden
Platform    from store
```

---

## Database Schema (PostgreSQL / Neon DB)

### 1. `public.users`
Stores all platform accounts across all roles.

| Column | Type | Constraints | Default |
| --- | --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing |
| `name` | `VARCHAR(100)` | `NOT NULL` | — |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE` | — |
| `password` | `TEXT` | `NOT NULL` | — |
| `role` | `VARCHAR(30)` | `NOT NULL`, `CHECK (role IN ('customer', 'vendor', 'superadmin'))` | `'customer'` |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |

**Constraints & Indexes:**
- `CONSTRAINT users_pkey PRIMARY KEY (id)`
- `CONSTRAINT users_email_key UNIQUE (email)`
- `CONSTRAINT users_role_check CHECK (role IN ('customer', 'vendor', 'superadmin'))`
- `INDEX users_pkey USING BTREE (id)`
- `INDEX users_email_key USING BTREE (email)`

---

### 2. `public.vendors`
Stores store and business information linked 1:1 to vendor users.

| Column | Type | Constraints | Default |
| --- | --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing |
| `user_id` | `INTEGER` | `NOT NULL`, `UNIQUE`, `FK (public.users.id) ON DELETE CASCADE` | — |
| `business_name` | `VARCHAR(255)` | `NOT NULL` | — |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |

**Constraints & Indexes:**
- `CONSTRAINT vendors_pkey PRIMARY KEY (id)`
- `CONSTRAINT vendors_user_id_key UNIQUE (user_id)`
- `CONSTRAINT vendors_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE`
- `INDEX vendors_pkey USING BTREE (id)`
- `INDEX vendors_user_id_key USING BTREE (user_id)`

---

### 3. `public.categories`
Stores product categories managed by administrators.

| Column | Type | Constraints | Default |
| --- | --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing |
| `name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | — |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |

**Constraints & Indexes:**
- `CONSTRAINT categories_pkey PRIMARY KEY (id)`
- `CONSTRAINT categories_name_key UNIQUE (name)`
- `INDEX categories_pkey USING BTREE (id)`
- `INDEX categories_name_key USING BTREE (name)`

---

### 4. `public.products`
Stores products added by vendors, subject to admin approval.

| Column | Type | Constraints | Default |
| --- | --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing |
| `vendor_id` | `INTEGER` | `FK (public.vendors.id) ON DELETE SET NULL` | — |
| `category_id` | `INTEGER` | `NOT NULL`, `FK (public.categories.id) ON DELETE RESTRICT` | — |
| `name` | `VARCHAR(255)` | `NOT NULL` | — |
| `description` | `TEXT` | — | — |
| `price` | `NUMERIC(10, 2)` | `NOT NULL`, `CHECK (price >= 0)` | — |
| `stock` | `INTEGER` | `NOT NULL`, `CHECK (stock >= 0)` | `0` |
| `approval_status` | `VARCHAR(20)` | `NOT NULL`, `CHECK (approval_status IN ('pending', 'approved', 'rejected'))` | `'pending'` |
| `approved_by` | `INTEGER` | `FK (public.users.id) ON DELETE SET NULL` | `NULL` |
| `approved_at` | `TIMESTAMP` | — | `NULL` |
| `is_active` | `BOOLEAN` | `NOT NULL` | `true` |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |

**Constraints & Indexes:**
- `CONSTRAINT products_pkey PRIMARY KEY (id)`
- `CONSTRAINT products_approval_status_check CHECK (approval_status IN ('pending', 'approved', 'rejected'))`
- `CONSTRAINT products_price_check CHECK (price >= 0)`
- `CONSTRAINT products_stock_check CHECK (stock >= 0)`
- `CONSTRAINT products_vendor_id_fkey FOREIGN KEY (vendor_id) REFERENCES public.vendors(id) ON DELETE SET NULL`
- `CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT`
- `CONSTRAINT products_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL`
- `INDEX products_pkey USING BTREE (id)`

---

### 5. `public.orders`
Stores customer orders and purchase details.

| Column | Type | Constraints | Default |
| --- | --- | --- | --- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing |
| `customer_id` | `INTEGER` | `NOT NULL`, `FK (public.users.id) ON DELETE RESTRICT` | — |
| `total_amount` | `NUMERIC(10, 2)` | `NOT NULL`, `CHECK (total_amount >= 0)` | — |
| `status` | `VARCHAR(30)` | `NOT NULL`, `CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))` | `'pending'` |
| `product_id` | `INTEGER` | `FK (public.products.id) ON DELETE SET NULL` | `NULL` |
| `product_name` | `VARCHAR(255)` | — | `NULL` |
| `unit_price` | `NUMERIC(10, 2)` | — | `NULL` |
| `quantity` | `INTEGER` | — | `1` |
| `created_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP` | `NOT NULL` | `CURRENT_TIMESTAMP` |

**Constraints & Indexes:**
- `CONSTRAINT orders_pkey PRIMARY KEY (id)`
- `CONSTRAINT orders_status_check CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled'))`
- `CONSTRAINT orders_total_amount_check CHECK (total_amount >= 0)`
- `CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.users(id) ON DELETE RESTRICT`
- `INDEX orders_pkey USING BTREE (id)`

---

## Referential Integrity & Delete Behaviors

| Relationship | Delete Behavior | Reason |
| --- | --- | --- |
| `users → vendors` | **CASCADE** | Deleting a vendor user account removes their vendor profile. |
| `vendors → products` | **SET NULL / CASCADE** | Products retain history or are cleaned up when vendor is removed. |
| `categories → products` | **RESTRICT** | Prevents deleting a category that still contains active products. |
| `users → orders` | **RESTRICT** | Preserves customer order transaction history. |
| `products → orders` | **SET NULL / RESTRICT** | Keeps order history intact even if a product is removed from the catalog. |
| `products → approved_by` | **SET NULL** | Retains product approval status even if the reviewing admin user is removed. |

---

## Project Setup & Running

```bash
# Install dependencies
$ npm install

# Run in development watch mode
$ npm run start:dev

# Run in production mode
$ npm run start:prod
```
