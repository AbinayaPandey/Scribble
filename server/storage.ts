
import { db } from "./db";
import {
  uploads,
  type InsertUpload,
  type Upload
} from "@shared/schema";

export interface IStorage {
  // Basic interface, though we might not strictly use it for this frontend-focused app
  createUpload(upload: InsertUpload): Promise<Upload>;
}

export class DatabaseStorage implements IStorage {
  async createUpload(insertUpload: InsertUpload): Promise<Upload> {
    const [upload] = await db.insert(uploads).values(insertUpload).returning();
    return upload;
  }
}

export const storage = new DatabaseStorage();
