import { z } from "zod";

export const schema = z.object({
    question: z.string().describe("Question").default("What is the capital of France?"),
    answer: z.string().describe("Answer").default("Paris"),
    imageUrl: z.string().url().optional().or(z.literal("")).describe("Image URL (Optional)"),
});

export type FlashCardContent = z.infer<typeof schema>;
