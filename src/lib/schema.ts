import { z } from "zod";

/**
 * Shared types/validation for the whole app (form UI, API routes, and — once
 * you add it — any script that talks to the DB directly). Keep this file as
 * the single source of truth for what a "post" looks like; the SQL migration
 * in supabase/migrations/0001_init.sql should stay in sync with it.
 */

export const CATEGORIES = [
  "electronics",
  "bag",
  "keys",
  "clothing",
  "pet",
  "document",
  "other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  electronics: "Electronics",
  bag: "Bag/backpack",
  keys: "Keys",
  clothing: "Clothing",
  pet: "Pet",
  document: "ID/documents",
  other: "Other",
};

// ---------------------------------------------------------------------
// Finder's "post what you found" form
// ---------------------------------------------------------------------
export const createPostSchema = z.object({
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(1, "Please enter an item description").max(500),
  photoUrl: z.string().url().optional().nullable(),
  lng: z.number().min(-180).max(180),
  lat: z.number().min(-90).max(90),
  locationLabel: z.string().trim().min(1, "Please enter the found location").max(200),
  foundAt: z.string().datetime().optional(),
  contactInfo: z.string().trim().min(1, "Please enter contact info").max(200),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;

// ---------------------------------------------------------------------
// Lost person's search/filter form
// ---------------------------------------------------------------------
export const searchQuerySchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  keyword: z.string().trim().max(200).optional(),
  lng: z.number().min(-180).max(180).optional(),
  lat: z.number().min(-90).max(90).optional(),
  radiusMeters: z.number().positive().max(50_000).default(5000),
  hours: z.number().int().positive().max(24 * 30).optional(),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// ---------------------------------------------------------------------
// A single row back from search_posts()
// ---------------------------------------------------------------------
export const postResultSchema = z.object({
  id: z.string().uuid(),
  category: z.enum(CATEGORIES),
  description: z.string(),
  photoUrl: z.string().nullable(),
  locationLabel: z.string(),
  foundAt: z.string(),
  contactInfo: z.string(),
  distanceMeters: z.number().nullable(),
});

export type PostResult = z.infer<typeof postResultSchema>;
