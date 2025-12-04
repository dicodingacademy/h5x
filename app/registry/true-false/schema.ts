import { z } from "zod";

export const schema = z.object({
    question: z.string().describe("Question text"),
    correctResponse: z.boolean().describe("Correct Answer (True/False)").default(true),
    feedbackOnCorrect: z.string().describe("Feedback on correct answer").optional(),
    feedbackOnIncorrect: z.string().describe("Feedback on incorrect answer").optional(),
});

export type TrueFalseContent = z.infer<typeof schema>;
