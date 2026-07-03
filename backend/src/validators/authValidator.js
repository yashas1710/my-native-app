import { z } from "zod";

// Email must be valid, lowercase, trimmed
const emailSchema = z
  .string()
  .email("Invalid email format")
  .toLowerCase()
  .trim();

// Password must be at least 6 chars
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

// Name must be 2-100 chars, trimmed
const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be under 100 characters")
  .trim();

// Accommodation ID: string identifier
const accommodationIdSchema = z
  .string()
  .min(1, "Accommodation ID is required")
  .trim()
  .toLowerCase();

const genderSchema = z.enum(["male", "female", "other", "prefer_not_to_say"]).optional();

export const signupSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  accommodationId: accommodationIdSchema,
  gender: genderSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const updateProfileSchema = z.object({
  name: nameSchema.optional(),
  bio: z.string().max(500).optional(),
  photoUrl: z.string().url().optional(),
  gender: genderSchema,
});

export const validateInput = (schema, data) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (err) {
    return {
      success: false,
      errors: err.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }
};
