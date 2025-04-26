import { z } from "zod";

export const challengeSchema = z.object({
  title: z.string(),
  description: z.string(),
  tasks: z
    .array(
      z.object({
        task: z.string(),
        description: z.string(),
      }),
    )
    .min(4),
});
