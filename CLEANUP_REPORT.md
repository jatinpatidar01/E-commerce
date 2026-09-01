# Project Cleanup Report

## Deleted Files

- `frontend/src/lib/auth.js` — unused browser auth/localStorage helper; no file imported it.
- `frontend/src/data/dummyProducts.js` — unused mock product data.
- `frontend/src/components/productCard.js` — unused duplicate product-card component; the customer component is the active one.
- `frontend/src/services/page.js` — empty, unused service file.
- `frontend/public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, and `window.svg` — unreferenced starter assets.
- `backend/src/payments/**` and `backend/src/notifications/**` — empty, unregistered scaffolding with no routes, providers, or callers.
- `backend/src/cart/entities/cart.entity.js`, `cart-item.entity.js`; `backend/src/categories/entities/category.entity.js`; `backend/src/payments/entities/payment.entity.js` — empty entity placeholders with no imports.
- `backend/src/common/filters/http-exception.filter.js` and `backend/src/auth/strategies/jwt.strategy.js` — empty, unused placeholders.

## Modified Files

- `backend/src/app.module.js` — removed unused payment and notification module imports/registrations.
- `backend/src/admin/admin.service.js` — removed unused `nodemailer` import.
- `backend/src/auth/auth.controller.js` and `auth.service.js` — removed commented/debug OTP output, including the unsafe development OTP fallback log.
- `frontend/src/lib/api.js` — removed unused `api.put` wrapper.
- `frontend/src/services/product.service.js` — removed unused vendor product CRUD/status methods; active vendor pages use `vendor.service.js`.
- `frontend/src/services/auth.service.js` — removed unused `refreshSession`; refresh remains handled centrally by `lib/api.js` on 401 responses.
- `frontend/src/app/login/page.js` and `app/vendor/profile/page.js` — removed commented-out debug logs.
- `frontend/package.json` and `package-lock.json` — removed unused frontend `jsonwebtoken` dependency declaration.

## Removed Code

- Duplicate frontend product-management API wrappers that had no callers.
- Empty payment/notification modules and empty entity/filter/strategy placeholders.
- Unused auth-browser persistence helper, mock data, duplicate component, starter assets, and debug output.

## Cart Cleanup

No guest-cart or cart-localStorage implementation remained in the project, so none was removed. The active cart flow is already backend-only: `CartContext` calls `cartService`, which uses authenticated `/cart` endpoints with cookies and the API client's refresh handling. No cart state is persisted in browser storage.

## Kept Code

- JWT validation, refresh-token handling, HTTP-only cookie flow, auth guards, and authorization checks.
- Backend cart, order, product, category, customer, vendor, and admin APIs.
- The active customer product card and all vendor product service methods used by vendor pages.
- Error handling that drives user-visible error states and authentication recovery.

## Verification

- Searched the full project for imports/references before deletion and re-searched after cleanup; no stale references to deleted code remain.
- Reviewed active frontend service call sites and backend module/controller registrations.
- `git diff --check` completed with no whitespace errors.
- Frontend lint, dependency-lock regeneration, and Node syntax checks could not run because the sandbox blocks Node from resolving `C:\Users\jatin` (`EPERM`); the requested elevated lint run was not approved.

## Potential Issues

- The inactive `/customer/products` placeholder route, `RolesGuard`, the product approval endpoint, and remaining operational `console.error` calls were intentionally kept: they are reachable/authorization-related or may aid real error diagnosis.
