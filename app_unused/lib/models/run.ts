import { z } from "zod";

export const RunStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "canceled",
]);

export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunSchema = z.object({
  id: z.string(),
  ownerId: z.string(),
  projectId: z.string(),
  title: z.string().min(1).max(140),
  input: z.any().optional(),
  status: RunStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Run = z.infer<typeof RunSchema>;

export const CreateRunInputSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(140),
  input: z.any().optional(),
});

export type CreateRunInput = z.infer<typeof CreateRunInputSchema>;
