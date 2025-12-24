import { z } from "zod";

export const LogLevelSchema = z.enum(["debug", "info", "warn", "error"]);
export type LogLevel = z.infer<typeof LogLevelSchema>;

export const RunLogSchema = z.object({
  ts: z.string(),
  level: LogLevelSchema,
  message: z.string(),
  data: z.any().optional(),
});

export type RunLog = z.infer<typeof RunLogSchema>;
