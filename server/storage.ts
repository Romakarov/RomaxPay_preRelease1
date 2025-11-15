import { eq, desc, and } from 'drizzle-orm';
import { db } from './db';
import { users, paymentRequests, notifications, deposits, operators } from '@shared/schema';
import type { User, InsertUser, PaymentRequest, InsertPaymentRequest, Notification, InsertNotification, Deposit, InsertDeposit, Operator, InsertOperator } from '@shared/schema';

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: string, availableBalance: string, frozenBalance: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  
  // Payment request methods
  getPaymentRequest(id: string): Promise<PaymentRequest | undefined>;
  getPaymentRequestsByUserId(userId: string): Promise<PaymentRequest[]>;
  createPaymentRequest(request: InsertPaymentRequest): Promise<PaymentRequest>;
  updatePaymentRequestStatus(id: string, status: string): Promise<void>;
  updatePaymentRequestWithReceipt(id: string, status: string, receipt: any): Promise<void>;
  updatePaymentRequestFull(id: string, updates: { status?: string; receipt?: any; adminComment?: string; amountRub?: string; amountUsdt?: string }): Promise<void>;
  getAllPaymentRequests(): Promise<PaymentRequest[]>;
  
  // Notification methods
  getNotificationsByUserId(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<void>;
  getUnreadNotificationsCount(userId: string): Promise<number>;
  
  // Deposit methods
  getDeposit(id: string): Promise<Deposit | undefined>;
  getDepositsByUserId(userId: string): Promise<Deposit[]>;
  getPendingDeposits(): Promise<Deposit[]>;
  createDeposit(deposit: InsertDeposit): Promise<Deposit>;
  confirmDeposit(id: string, confirmedBy: string): Promise<void>;
  rejectDeposit(id: string): Promise<void>;
  
  // Operator methods
  getOperator(id: string): Promise<Operator | undefined>;
  getOperatorByLogin(login: string): Promise<Operator | undefined>;
  getAllOperators(): Promise<Operator[]>;
  createOperator(operator: InsertOperator): Promise<Operator>;
  updateOperatorStatus(id: string, isActive: number): Promise<void>;
  deleteOperator(id: string): Promise<void>;
}

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.telegramId, telegramId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserBalance(userId: string, availableBalance: string, frozenBalance: string): Promise<void> {
    await db.update(users)
      .set({ availableBalance, frozenBalance })
      .where(eq(users.id, userId));
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select()
      .from(users)
      .orderBy(desc(users.registeredAt));
  }

  // Payment request methods
  async getPaymentRequest(id: string): Promise<PaymentRequest | undefined> {
    const result = await db.select().from(paymentRequests).where(eq(paymentRequests.id, id)).limit(1);
    return result[0];
  }

  async getPaymentRequestsByUserId(userId: string): Promise<PaymentRequest[]> {
    return await db.select()
      .from(paymentRequests)
      .where(eq(paymentRequests.userId, userId))
      .orderBy(desc(paymentRequests.createdAt));
  }

  async createPaymentRequest(insertRequest: InsertPaymentRequest): Promise<PaymentRequest> {
    const result = await db.insert(paymentRequests).values(insertRequest).returning();
    return result[0];
  }

  async updatePaymentRequestStatus(id: string, status: string): Promise<void> {
    await db.update(paymentRequests)
      .set({ status })
      .where(eq(paymentRequests.id, id));
  }

  async updatePaymentRequestWithReceipt(id: string, status: string, receipt: any): Promise<void> {
    await db.update(paymentRequests)
      .set({ status, receipt })
      .where(eq(paymentRequests.id, id));
  }

  async updatePaymentRequestFull(id: string, updates: { status?: string; receipt?: any; adminComment?: string; amountRub?: string; amountUsdt?: string }): Promise<void> {
    await db.update(paymentRequests)
      .set(updates)
      .where(eq(paymentRequests.id, id));
  }

  async getAllPaymentRequests(): Promise<PaymentRequest[]> {
    return await db.select()
      .from(paymentRequests)
      .orderBy(desc(paymentRequests.createdAt));
  }

  // Notification methods
  async getNotificationsByUserId(userId: string): Promise<Notification[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values(insertNotification).returning();
    return result[0];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await db.update(notifications)
      .set({ isRead: 1 })
      .where(eq(notifications.id, id));
  }

  async getUnreadNotificationsCount(userId: string): Promise<number> {
    const result = await db.select()
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, 0)
      ));
    return result.length;
  }

  // Deposit methods
  async getDeposit(id: string): Promise<Deposit | undefined> {
    const result = await db.select().from(deposits).where(eq(deposits.id, id)).limit(1);
    return result[0];
  }

  async getDepositsByUserId(userId: string): Promise<Deposit[]> {
    return await db.select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt));
  }

  async getPendingDeposits(): Promise<Deposit[]> {
    return await db.select()
      .from(deposits)
      .where(eq(deposits.status, 'pending'))
      .orderBy(desc(deposits.createdAt));
  }

  async createDeposit(insertDeposit: InsertDeposit): Promise<Deposit> {
    const result = await db.insert(deposits).values(insertDeposit).returning();
    return result[0];
  }

  async confirmDeposit(id: string, confirmedBy: string): Promise<void> {
    await db.update(deposits)
      .set({ 
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy 
      })
      .where(eq(deposits.id, id));
  }

  async rejectDeposit(id: string): Promise<void> {
    await db.update(deposits)
      .set({ status: 'rejected' })
      .where(eq(deposits.id, id));
  }

  // Operator methods
  async getOperator(id: string): Promise<Operator | undefined> {
    const result = await db.select().from(operators).where(eq(operators.id, id)).limit(1);
    return result[0];
  }

  async getOperatorByLogin(login: string): Promise<Operator | undefined> {
    const result = await db.select().from(operators).where(eq(operators.login, login)).limit(1);
    return result[0];
  }

  async getAllOperators(): Promise<Operator[]> {
    return await db.select()
      .from(operators)
      .orderBy(desc(operators.createdAt));
  }

  async createOperator(insertOperator: InsertOperator): Promise<Operator> {
    const result = await db.insert(operators).values(insertOperator).returning();
    return result[0];
  }

  async updateOperatorStatus(id: string, isActive: number): Promise<void> {
    await db.update(operators)
      .set({ isActive })
      .where(eq(operators.id, id));
  }

  async deleteOperator(id: string): Promise<void> {
    await db.delete(operators).where(eq(operators.id, id));
  }
}

export const storage = new PostgresStorage();
