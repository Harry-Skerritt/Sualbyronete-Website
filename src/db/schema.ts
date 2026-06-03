import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const puppies = sqliteTable('puppies', {
    seqID: integer('seq_id').primaryKey({ autoIncrement: true }),
    breed: text('breed', { enum: ["state-one", "state-two"] }).notNull(),
    id: text('id').generatedAlwaysAs(
        () => sql`CASE
              WHEN breed = 'state-one' THEN 'YT' || PRINTF('%03d', seq_id)
              ELSE 'BT' || PRINTF('%03d', seq_id)
            END`
    ),
    name: text('name').notNull(),
    gender: text('gender', { enum: ["Male", "Female"] }).notNull(),
    colour: text('colour', { enum: ["Black & Tan", "Steel & Tan", "Blue & Tan", "Black & Gold", "Black", "Black & White", "Blue & White", "White", "Blue"]}).notNull(),
    status: text('status', { enum: ["New", "Available", "Reserved", "Sold"]}).notNull(),
    image: text('image').notNull(),
})

/* Deployment?
export const puppies = sqliteTable('puppies', {
    seqID: integer('seq_id').primaryKey({ autoIncrement: true }),
    breed: text('breed').notNull(),
    id: text('id').generatedAlwaysAs(
        () => sql`CASE
              WHEN breed = 'state-one' THEN 'YT' || PRINTF('%03d', seq_id)
              ELSE 'BT' || PRINTF('%03d', seq_id)
            END`
    ),
    name: text('name').notNull(),
    gender: text('gender').notNull(),
    colour: text('colour').notNull(),
    status: text('status').notNull(),
    image: text('image').notNull(),
})
 */