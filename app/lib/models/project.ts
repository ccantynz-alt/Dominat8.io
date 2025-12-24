// lib/models/project.ts
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  ownerId: z.string(), // auth later; for now "demo"
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
  createdAt: z.string(), // ISO
  updatedAt: z.string(), // ISO
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().default(""),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
