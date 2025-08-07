import { z } from "zod";

export const moduleSchema = z.object({
  title: z.string().min(1, "Module title is required"),
  content: z.string().min(1, "Module content is required"),
  order: z.number().min(1).optional(),
  video_url: z.string().url("Video URL must be valid").optional().or(z.literal("")),
});

export const lessonSchema = z.object({
  title: z.string().min(1, "Lesson title is required"),
  order: z.number().min(1).optional(),
  modules: z.array(moduleSchema).min(1, "At least one module is required"),
});

export const createCourseSchema = z.object({
  title: z.string().min(1, "Course title is required"),
  description: z.string().min(1, "Course description is required"),
  price: z.number().min(1, "Price must be at least Rp. 1"),
  lessons: z.array(lessonSchema).min(1, "At least one lesson is required"),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
