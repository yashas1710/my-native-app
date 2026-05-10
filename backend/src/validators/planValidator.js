import { z } from "zod";

const titleSchema = z
  .string()
  .min(3, "Title must be at least 3 characters")
  .max(200, "Title must be under 200 characters")
  .trim();

const locationSchema = z
  .string()
  .min(2, "Location must be at least 2 characters")
  .max(200, "Location must be under 200 characters")
  .trim();

const descriptionSchema = z
  .string()
  .max(500, "Description must be under 500 characters")
  .optional()
  .default("");

const dateSchema = z.coerce.date().refine(
  (date) => date > new Date(),
  {
    message: "Date must be in the future",
  }
);

const maxSpotsSchema = z
  .number()
  .int("Max spots must be an integer")
  .min(1, "Max spots must be at least 1")
  .max(100, "Max spots cannot exceed 100")
  .optional()
  .nullable();

export const createPlanSchema = z
  .object({
    title: titleSchema,
    location: locationSchema,
    description: descriptionSchema,

    startDate: dateSchema,

    endDate: z.coerce.date().optional().nullable(),

    maxSpots: maxSpotsSchema,
  })
  .refine(
    (data) =>
      !data.endDate ||
      data.endDate > data.startDate,
    {
      message:
        "End date must be after start date",
      path: ["endDate"],
    }
  );

export const updatePlanSchema = z
  .object({
    title: titleSchema.optional(),

    location: locationSchema.optional(),

    description: descriptionSchema.optional(),

    startDate: dateSchema.optional(),

    endDate: z.coerce.date().optional().nullable(),

    maxSpots: maxSpotsSchema,
  })
  .refine(
    (data) =>
      !data.startDate ||
      !data.endDate ||
      data.endDate > data.startDate,
    {
      message:
        "End date must be after start date",
      path: ["endDate"],
    }
  );

export const validateInput = (
  schema,
  data
) => {
  try {
    return {
      success: true,
      data: schema.parse(data),
    };
  } catch (err) {
    return {
      success: false,
      errors: err.issues.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      })),
    };
  }
};