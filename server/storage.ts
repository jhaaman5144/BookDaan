import {
  users,
  books,
  requests,
  feedback,
  notifications,
  type User,
  type UpsertUser,
  type Book,
  type InsertBook,
  type Request,
  type InsertRequest,
  type Feedback,
  type InsertFeedback,
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, updates: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  
  // Book operations
  createBook(book: InsertBook): Promise<Book>;
  getBook(id: number): Promise<Book | undefined>;
  getBooksByDonor(donorId: string): Promise<Book[]>;
  getAllBooks(filters?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }>;
  updateBook(id: number, updates: Partial<Book>): Promise<Book>;
  deleteBook(id: number): Promise<void>;
  
  // Request operations
  createRequest(request: InsertRequest): Promise<Request>;
  getRequest(id: number): Promise<Request | undefined>;
  getRequestsByRecipient(recipientId: string): Promise<Request[]>;
  getRequestsByDonor(donorId: string): Promise<Request[]>;
  updateRequestStatus(id: number, status: string): Promise<Request>;
  
  // Feedback operations
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByUser(userId: string): Promise<Feedback[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Recommendation operations
  getRecommendedBooks(userId: string): Promise<Book[]>;
  
  // Admin operations
  getStats(): Promise<{
    totalBooks: number;
    totalUsers: number;
    totalRequests: number;
    co2Saved: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Book operations
  async createBook(book: InsertBook): Promise<Book> {
    const [createdBook] = await db.insert(books).values(book).returning();
    return createdBook;
  }

  async getBook(id: number): Promise<Book | undefined> {
    const [book] = await db.select().from(books).where(eq(books.id, id));
    return book;
  }

  async getBooksByDonor(donorId: string): Promise<Book[]> {
    return await db
      .select()
      .from(books)
      .where(eq(books.donorId, donorId))
      .orderBy(desc(books.createdAt));
  }

  async getAllBooks(filters?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ books: Book[]; total: number }> {
    const { search, category, status, page = 1, limit = 20 } = filters || {};
    
    let query = db.select().from(books);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(books);
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(books.title, `%${search}%`),
          like(books.author, `%${search}%`),
          like(books.description, `%${search}%`)
        )
      );
    }
    
    if (category) {
      conditions.push(eq(books.category, category));
    }
    
    if (status) {
      conditions.push(eq(books.status, status));
    }
    
    if (conditions.length > 0) {
      const whereCondition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(whereCondition);
      countQuery = countQuery.where(whereCondition);
    }
    
    const [totalResult] = await countQuery;
    const total = totalResult.count;
    
    const bookResults = await query
      .orderBy(desc(books.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    
    return { books: bookResults, total };
  }

  async updateBook(id: number, updates: Partial<Book>): Promise<Book> {
    const [book] = await db
      .update(books)
      .set(updates)
      .where(eq(books.id, id))
      .returning();
    return book;
  }

  async deleteBook(id: number): Promise<void> {
    await db.delete(books).where(eq(books.id, id));
  }

  // Request operations
  async createRequest(request: InsertRequest): Promise<Request> {
    const [createdRequest] = await db.insert(requests).values(request).returning();
    return createdRequest;
  }

  async getRequest(id: number): Promise<Request | undefined> {
    const [request] = await db.select().from(requests).where(eq(requests.id, id));
    return request;
  }

  async getRequestsByRecipient(recipientId: string): Promise<Request[]> {
    return await db
      .select()
      .from(requests)
      .where(eq(requests.recipientId, recipientId))
      .orderBy(desc(requests.createdAt));
  }

  async getRequestsByDonor(donorId: string): Promise<Request[]> {
    return await db
      .select({
        id: requests.id,
        bookId: requests.bookId,
        recipientId: requests.recipientId,
        message: requests.message,
        status: requests.status,
        pickupLocation: requests.pickupLocation,
        createdAt: requests.createdAt,
      })
      .from(requests)
      .innerJoin(books, eq(requests.bookId, books.id))
      .where(eq(books.donorId, donorId))
      .orderBy(desc(requests.createdAt));
  }

  async updateRequestStatus(id: number, status: string): Promise<Request> {
    const [request] = await db
      .update(requests)
      .set({ status })
      .where(eq(requests.id, id))
      .returning();
    return request;
  }

  // Feedback operations
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [createdFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return createdFeedback;
  }

  async getFeedbackByUser(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.toId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [createdNotification] = await db.insert(notifications).values(notification).returning();
    return createdNotification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Recommendation operations
  async getRecommendedBooks(userId: string): Promise<Book[]> {
    const user = await this.getUser(userId);
    if (!user || !user.preferences || user.preferences.length === 0) {
      // Return recent books if no preferences
      const { books: recentBooks } = await this.getAllBooks({ limit: 5, status: "available" });
      return recentBooks;
    }

    // Simple recommendation based on user preferences
    const recommendedBooks = await db
      .select()
      .from(books)
      .where(
        and(
          eq(books.status, "available"),
          or(...user.preferences.map(pref => like(books.category, `%${pref}%`)))
        )
      )
      .limit(5)
      .orderBy(desc(books.createdAt));

    return recommendedBooks;
  }

  // Admin operations
  async getStats(): Promise<{
    totalBooks: number;
    totalUsers: number;
    totalRequests: number;
    co2Saved: number;
  }> {
    const [booksCount] = await db.select({ count: sql<number>`count(*)` }).from(books);
    const [usersCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [requestsCount] = await db.select({ count: sql<number>`count(*)` }).from(requests);
    
    // Simple CO2 calculation: assume each book saves 2.1kg CO2
    const co2Saved = Math.round((booksCount.count * 2.1) / 1000 * 10) / 10; // Convert to tons with 1 decimal

    return {
      totalBooks: booksCount.count,
      totalUsers: usersCount.count,
      totalRequests: requestsCount.count,
      co2Saved,
    };
  }
}

export const storage = new DatabaseStorage();
