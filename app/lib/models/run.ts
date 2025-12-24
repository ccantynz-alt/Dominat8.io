// lib/models/run.ts
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
  ownerId: z.string(), // auth later; for now "demo"
  projectId: z.string(),
  title: z.string().min(1).max(140),
  input: z.any().optional(), // arbitrary run payload (tool args, etc.)
  status: RunStatusSchema,
  createdAt: z.string(), // ISO
  updatedAt: z.string(), // ISO
});

export type Run = z.infer<typeof RunSchema>;

export const CreateRunInputSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1).max(140),
  input: z.any().optional(),
});

export type CreateRunInput = z.infer<typeof CreateRunInputSchema>;
