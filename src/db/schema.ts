import { pgTable, uuid, varchar, text, timestamp, boolean, integer, numeric, jsonb, pgEnum, check, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Enums
export const orderStatusEnum = pgEnum('order_status', ['pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'authorized', 'captured', 'failed', 'refunded']);

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).unique().notNull(), // MSG91-verified phone is now the login identifier
  email: varchar('email', { length: 255 }).unique(),
  displayName: varchar('display_name', { length: 255 }),
  marketingConsent: boolean('marketing_consent').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions (DB-backed; the cookie just holds this row's id, revocable by deleting the row)
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('sessions_user_id_idx').on(table.userId),
]);

// Addresses
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  addressLine: varchar('address_line', { length: 255 }).notNull(),
  landmark: varchar('landmark', { length: 255 }),
  city: varchar('city', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 6 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Products
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  check('price_positive', sql`${table.price} >= 0`)
]);

// Product Media
export const productMedia = pgTable('product_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'image' or 'video'
  sortOrder: integer('sort_order').default(0).notNull(),
});

// Inventory (Separated for fast row-level locking)
export const inventory = pgTable('inventory', {
  productId: uuid('product_id').primaryKey().references(() => products.id, { onDelete: 'restrict' }),
  availableQuantity: integer('available_quantity').notNull().default(0),
  reservedQuantity: integer('reserved_quantity').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  check('available_positive', sql`${table.availableQuantity} >= 0`),
  check('reserved_positive', sql`${table.reservedQuantity} >= 0`)
]);

// Carts
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').notNull().references(() => carts.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('cart_qty_positive', sql`${table.quantity} > 0`)
]);

// Orders (Immutable once created)
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  status: orderStatusEnum('status').default('pending').notNull(),
  totalAmount: numeric('total_amount', { precision: 12, scale: 2 }).notNull(),
  deviceFingerprint: varchar('device_fingerprint', { length: 255 }), // For fraud detection
  ipAddress: varchar('ip_address', { length: 45 }), // Support IPv6
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  check('total_positive', sql`${table.totalAmount} >= 0`)
]);

// Order Lines (Immutable snapshots)
export const orderLines = pgTable('order_lines', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'restrict' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  snapshotPrice: numeric('snapshot_price', { precision: 10, scale: 2 }).notNull(),
  snapshotName: varchar('snapshot_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  check('line_qty_positive', sql`${table.quantity} > 0`),
  check('line_price_positive', sql`${table.snapshotPrice} >= 0`)
]);

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'restrict' }),
  idempotencyKey: varchar('idempotency_key', { length: 255 }).notNull().unique(), // Prevent double charges
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  gatewayReference: varchar('gateway_reference', { length: 255 }), // e.g., Stripe pi_xxx
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Audit Logs (Append-only ledger)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  tableName: varchar('table_name', { length: 50 }).notNull(),
  recordId: uuid('record_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(),
  changedBy: uuid('changed_by'), // Could be a user ID or admin ID
  oldData: jsonb('old_data'),
  newData: jsonb('new_data'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// OTP Send Log (Append-only, used purely for server-side rate limiting on the MSG91 Send/Resend calls)
export const otpSendLog = pgTable('otp_send_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  phone: varchar('phone', { length: 20 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('otp_send_log_phone_idx').on(table.phone, table.createdAt),
  index('otp_send_log_ip_idx').on(table.ipAddress, table.createdAt),
]);
