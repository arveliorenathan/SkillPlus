import { z } from "zod";

//Create Course Schema
export const createCourseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Price must be at least Rp. 1"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
