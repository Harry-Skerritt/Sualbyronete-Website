import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const adults = sqliteTable('adults', {
    seqId: integer('seq_id').primaryKey({ autoIncrement: true}),
    breed: text('breed', { enum: ["state-one", "state-two"] }).notNull(),
    gender: text('gender').notNull(),

    id: text('id').generatedAlwaysAs(
        () => sql`
            (CASE WHEN LOWER(breed) = 'yorkie' THEN 'YT' ELSE 'BT' END) ||
            PRINTF('%03d', seq_id) ||
            (CASE WHEN LOWER(gender) = 'female' THEN '-D' ELSE '-S' END)
        `
    ).unique().notNull(),

    name: text('name').notNull(),
    colour: text('colour').notNull(),
    image: text('image').notNull().default("default.png"),
    dob: text('dob').notNull(),
    regID: text('regID').notNull().default("#0000"),
    forSale: integer('forSale', { mode: 'boolean' }).notNull().default(false),
    bio: text('bio').notNull().default("No bio specified"),
    puppies: text('puppies', { mode: 'json' }).$type<string[]>().notNull().default(sql`'[]'`),
    dateAdded: text('date_added').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const puppies = sqliteTable('puppies', {
    seqID: integer('seq_id').primaryKey({ autoIncrement: true }),
    breed: text('breed', { enum: ["state-one", "state-two"] }).notNull(),
    id: text('id').generatedAlwaysAs(
        () => sql`
            CASE
              WHEN LOWER(breed) = 'yorkie' THEN 'YT' || PRINTF('%03d', seq_id)
              ELSE 'BT' || PRINTF('%03d', seq_id)
            END
        `
    ).unique().notNull(),


    name: text('name').notNull(),
    gender: text('gender').notNull(),
    colour: text('colour').notNull(),
    status: text('status').notNull(),
    image: text('image').notNull(),
    dob: text('dob').notNull(),
    bio: text('bio').notNull().default("No bio specified."),

    mother: text('mother').notNull().references(() => adults.id),
    father: text('father').notNull().references(() => adults.id),

    availableFrom: text('availableFrom').notNull(),
    regID: text('regID').notNull().default("#0000"),
    dateAdded: text('date_added').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const adminUsers = sqliteTable('admin_users',{
    id: text('id').primaryKey().default(sql`(uuid4())`),
    email: text('email').unique().notNull(),
    name: text('name').notNull(),
    username: text('username').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ["admin", "editor"] }).notNull().default("editor"),
    lastLogin: text('last_login'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    dateCreated: text('date_created').notNull().default(sql`CURRENT_TIMESTAMP`),
});
