import z from "zod";

export const createMentorsSchema = z.object({
  name: z.string().min(1, "Fullname required"),
  company: z.string().optional(),
  specialization: z.string().optional(),
});

export type CreateMentorsInput = z.infer<typeof createMentorsSchema>;
