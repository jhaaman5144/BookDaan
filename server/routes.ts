import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertBookSchema, insertRequestSchema, insertFeedbackSchema, updateUserProfileSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple auth routes for development
  app.get('/api/login', (req, res) => {
    // For development, create a demo user session
    const demoUser = {
      id: 'demo-user-1',
      email: 'demo@bookdaan.com',
      firstName: 'Demo',
      lastName: 'User',
      role: 'donor'
    };
    
    // Set session
    (req as any).session = (req as any).session || {};
    (req as any).session.user = demoUser;
    
    // Redirect to home
    res.redirect('/');
  });

  app.get('/api/logout', (req, res) => {
    (req as any).session = null;
    res.redirect('/');
  });

  // Simple auth middleware
  const simpleAuth = (req: any, res: any, next: any) => {
    const user = req.session?.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  };

  // Auth routes
  app.get('/api/auth/user', simpleAuth, async (req: any, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.patch('/api/users/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = updateUserProfileSchema.parse(req.body);
      const user = await storage.updateUserProfile(userId, updates);
      res.json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Book routes
  app.get('/api/books', async (req, res) => {
    try {
      const { search, category, status, page, limit } = req.query;
      const filters = {
        search: search as string,
        category: category as string,
        status: (status as string) || "available",
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 20,
      };
      
      const result = await storage.getAllBooks(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.get('/api/books/:id', async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const book = await storage.getBook(bookId);
      
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Get donor information
      const donor = await storage.getUser(book.donorId);
      res.json({ ...book, donor });
    } catch (error) {
      console.error("Error fetching book:", error);
      res.status(500).json({ message: "Failed to fetch book" });
    }
  });

  app.post('/api/books', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookData = insertBookSchema.parse({ ...req.body, donorId: userId });
      const book = await storage.createBook(bookData);
      res.status(201).json(book);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating book:", error);
      res.status(500).json({ message: "Failed to create book" });
    }
  });

  app.get('/api/books/donor/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const books = await storage.getBooksByDonor(userId);
      res.json(books);
    } catch (error) {
      console.error("Error fetching donor books:", error);
      res.status(500).json({ message: "Failed to fetch books" });
    }
  });

  app.patch('/api/books/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = parseInt(req.params.id);
      
      // Check if user owns the book
      const book = await storage.getBook(bookId);
      if (!book || book.donorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updates = req.body;
      const updatedBook = await storage.updateBook(bookId, updates);
      res.json(updatedBook);
    } catch (error) {
      console.error("Error updating book:", error);
      res.status(500).json({ message: "Failed to update book" });
    }
  });

  app.delete('/api/books/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookId = parseInt(req.params.id);
      
      // Check if user owns the book
      const book = await storage.getBook(bookId);
      if (!book || book.donorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      await storage.deleteBook(bookId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting book:", error);
      res.status(500).json({ message: "Failed to delete book" });
    }
  });

  // Request routes
  app.post('/api/requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = insertRequestSchema.parse({ ...req.body, recipientId: userId });
      
      // Check if book is available
      const book = await storage.getBook(requestData.bookId);
      if (!book || book.status !== "available") {
        return res.status(400).json({ message: "Book is not available for request" });
      }
      
      const request = await storage.createRequest(requestData);
      
      // Update book status
      await storage.updateBook(requestData.bookId, { status: "requested" });
      
      // Create notification for donor
      await storage.createNotification({
        userId: book.donorId,
        type: "book_request",
        message: `Someone has requested your book "${book.title}"`,
      });
      
      res.status(201).json(request);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating request:", error);
      res.status(500).json({ message: "Failed to create request" });
    }
  });

  app.get('/api/requests/recipient/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getRequestsByRecipient(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching recipient requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.get('/api/requests/donor/me', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getRequestsByDonor(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error fetching donor requests:", error);
      res.status(500).json({ message: "Failed to fetch requests" });
    }
  });

  app.patch('/api/requests/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["accepted", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.getRequest(requestId);
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // Check if user is the donor of the book
      const book = await storage.getBook(request.bookId);
      if (!book || book.donorId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedRequest = await storage.updateRequestStatus(requestId, status);
      
      // Update book status based on request status
      if (status === "accepted") {
        await storage.updateBook(request.bookId, { status: "requested" });
      } else if (status === "rejected") {
        await storage.updateBook(request.bookId, { status: "available" });
      } else if (status === "completed") {
        await storage.updateBook(request.bookId, { status: "donated" });
      }
      
      // Create notification for recipient
      await storage.createNotification({
        userId: request.recipientId,
        type: "request_update",
        message: `Your book request has been ${status}`,
      });
      
      res.json(updatedRequest);
    } catch (error) {
      console.error("Error updating request status:", error);
      res.status(500).json({ message: "Failed to update request status" });
    }
  });

  // Recommendation routes
  app.get('/api/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const recommendations = await storage.getRecommendedBooks(userId);
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Feedback routes
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const feedbackData = insertFeedbackSchema.parse({ ...req.body, fromId: userId });
      const feedback = await storage.createFeedback(feedbackData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
