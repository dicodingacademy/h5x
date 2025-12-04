import { z } from "zod";

export const schema = z.object({
    text: z.string().describe("Text (Use *asterisks* for blanks)").default("The *sky* is blue."),
    distractors: z.array(z.object({
        text: z.string().describe("Distractor Text")
    })).default([]).describe("Extra Words (Distractors)"),
});

export type FillBlankContent = z.infer<typeof schema>;
