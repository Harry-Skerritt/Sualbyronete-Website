import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const puppies = sqliteTable('puppies', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    breed: text('breed').notNull(),
    gender: text('gender').notNull(),
    colour: text('colour').notNull(),
    status: text('status').notNull(),
    image: text('image').notNull(),
})