
import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't need a heavy database for this "frontend-only" request,
// but we keep the structure valid for the stack.
// We'll use a simple "uploads" table just to track session files if needed,
// though mostly this will be client-side.

export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUploadSchema = createInsertSchema(uploads).omit({ id: true, createdAt: true });

export type Upload = typeof uploads.$inferSelect;
export type InsertUpload = z.infer<typeof insertUploadSchema>;
