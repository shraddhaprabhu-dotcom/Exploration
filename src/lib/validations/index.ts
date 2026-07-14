import { z } from "zod";
import { PRODUCT_STATUSES } from "@/types";

export const productStatusSchema = z.enum(PRODUCT_STATUSES);

export const saveProductSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  image_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  brand: z.string().max(120).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().nullable(),
  currency: z.string().length(3).default("USD"),
  store: z.string().max(120).optional().or(z.literal("")),
  product_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  status: productStatusSchema.default("want"),
  is_favorite: z.boolean().default(false),
  collection_ids: z.array(z.string().uuid()).default([]),
  tag_names: z.array(z.string().min(1).max(40)).default([]),
});

export type SaveProductInput = z.infer<typeof saveProductSchema>;

export const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(1000).optional().or(z.literal("")),
  cover_image_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

export const urlImportSchema = z.object({
  url: z.string().url("Paste a valid product URL"),
});

export type UrlImportInput = z.infer<typeof urlImportSchema>;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = loginSchema.extend({
  display_name: z.string().min(1, "Name is required").max(80),
});

export type SignupInput = z.infer<typeof signupSchema>;

