import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  telegramId: text("telegram_id").notNull().unique(),
  username: text("username").notNull(),
  availableBalance: numeric("available_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  frozenBalance: numeric("frozen_balance", { precision: 18, scale: 8 }).notNull().default("0"),
  registeredAt: timestamp("registered_at").notNull().defaultNow(),
});

export const paymentRequests = pgTable("payment_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amountRub: numeric("amount_rub", { precision: 18, scale: 2 }).notNull(),
  amountUsdt: numeric("amount_usdt", { precision: 18, scale: 8 }).notNull(),
  frozenRate: numeric("frozen_rate", { precision: 18, scale: 2 }).notNull(),
  urgency: text("urgency").notNull(),
  hasUrgentFee: integer("has_urgent_fee").notNull().default(0),
  attachments: jsonb("attachments"),
  comment: text("comment"),
  status: text("status").notNull().default("submitted"),
  receipt: jsonb("receipt"),
  adminComment: text("admin_comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  requestId: varchar("request_id"),
  message: text("message").notNull(),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  amount: numeric("amount", { precision: 18, scale: 8 }).notNull(),
  status: text("status").notNull().default("pending"),
  txHash: text("tx_hash"),
  tronAddress: text("tron_address"),
  blockNumber: numeric("block_number", { precision: 20, scale: 0 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
  confirmedBy: varchar("confirmed_by"),
});

export const userTronAddresses = pgTable("user_tron_addresses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  tronAddress: text("tron_address").notNull().unique(),
  derivationIndex: integer("derivation_index").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const tronScanState = pgTable("tron_scan_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  lastBlockHeight: numeric("last_block_height", { precision: 20, scale: 0 }).notNull().default("0"),
  lastScanAt: timestamp("last_scan_at").notNull().defaultNow(),
  isScanning: integer("is_scanning").notNull().default(0),
});

export const operators = pgTable("operators", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  login: text("login").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  salt: varchar("salt", { length: 64 }).notNull(),
  isActive: integer("is_active").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  registeredAt: true,
});

export const insertPaymentRequestSchema = createInsertSchema(paymentRequests).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
  confirmedBy: true,
});

export const insertOperatorSchema = createInsertSchema(operators).omit({
  id: true,
  createdAt: true,
});

export const insertUserTronAddressSchema = createInsertSchema(userTronAddresses).omit({
  id: true,
  createdAt: true,
});

export const insertTronScanStateSchema = createInsertSchema(tronScanState).omit({
  id: true,
  lastScanAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertPaymentRequest = z.infer<typeof insertPaymentRequestSchema>;
export type PaymentRequest = typeof paymentRequests.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertOperator = z.infer<typeof insertOperatorSchema>;
export type Operator = typeof operators.$inferSelect;
export type InsertUserTronAddress = z.infer<typeof insertUserTronAddressSchema>;
export type UserTronAddress = typeof userTronAddresses.$inferSelect;
export type InsertTronScanState = z.infer<typeof insertTronScanStateSchema>;
export type TronScanState = typeof tronScanState.$inferSelect;

export type Attachment = {
  type: 'image' | 'link' | 'pdf' | 'doc' | 'docx';
  value: string;
  name?: string;
};
