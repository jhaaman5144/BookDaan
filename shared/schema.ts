import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["donor", "recipient", "admin"] }).notNull().default("recipient"),
  phone: varchar("phone"),
  address: text("address"),
  preferences: text("preferences").array(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Book storage table
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: varchar("title").notNull(),
  author: varchar("author").notNull(),
  isbn: varchar("isbn"),
  category: varchar("category").notNull(),
  language: varchar("language").notNull().default("English"),
  condition: varchar("condition", { enum: ["excellent", "good", "fair", "poor"] }).notNull(),
  coverImageUrl: text("cover_image_url"),
  description: text("description"),
  donorId: varchar("donor_id").notNull().references(() => users.id),
  status: varchar("status", { enum: ["available", "requested", "donated"] }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Request storage table
export const requests = pgTable("requests", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id),
  recipientId: varchar("recipient_id").notNull().references(() => users.id),
  message: text("message"),
  status: varchar("status", { enum: ["pending", "accepted", "rejected", "completed"] }).notNull().default("pending"),
  pickupLocation: text("pickup_location"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Feedback storage table
export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  fromId: varchar("from_id").notNull().references(() => users.id),
  toId: varchar("to_id").notNull().references(() => users.id),
  requestId: integer("request_id").notNull().references(() => requests.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification storage table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertBook = typeof books.$inferInsert;
export type Book = typeof books.$inferSelect;

export type InsertRequest = typeof requests.$inferInsert;
export type Request = typeof requests.$inferSelect;

export type InsertFeedback = typeof feedback.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;

export type InsertNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

// Zod schemas
export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
});

export const insertRequestSchema = createInsertSchema(requests).omit({
  id: true,
  createdAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const updateUserProfileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  preferences: z.array(z.string()).optional(),
});
