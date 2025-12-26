// app/lib/models/project.ts
import { z } from "zod";

export const ProjectSchema = z.object({
  id: z.string(),
  userId: z.string(),

  name: z.string().min(1).max(120),

  // For Emergent/GitHub import later
  repoUrl: z.string().url().optional(),
  defaultBranch: z.string().min(1).max(200).optional(),

  createdAt: z.string(), // ISO
  updatedAt: z.string() // ISO
});

export type Project = z.infer<typeof ProjectSchema>;

export const CreateProjectInputSchema = z.object({
  name: z.string().min(1).max(120),
  repoUrl: z.string().url().optional(),
  defaultBranch: z.string().min(1).max(200).optional()
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  repoUrl: z.string().url().optional(),
  defaultBranch: z.string().min(1).max(200).optional()
});

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
