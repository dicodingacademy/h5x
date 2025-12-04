import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const contents = sqliteTable("contents", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    type: text("type"), // e.g., 'multiple-choice', 'true-false'
    content: text("content", { mode: "json" }), // Stores the JSON structure
    createdAt: integer("created_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
        .notNull()
        .default(sql`(unixepoch())`),
});

export type Content = typeof contents.$inferSelect;
export type NewContent = typeof contents.$inferInsert;
