import { z } from "zod";

export const schema = z.object({
    title: z.string().describe("Quiz Title").default("My Quiz"),
    questions: z.array(
        z.object({
            text: z.string().describe("Question text"),
            answers: z
                .array(
                    z.object({
                        text: z.string().describe("Answer text"),
                        correct: z.boolean().describe("Correct").default(false),
                    })
                )
                .describe("Answers"),
        })
    ).describe("Questions"),
    settings: z.object({
        passingScore: z.number().min(0).max(100).describe("Passing Score (%)").default(80),
        showIncorrectAnswers: z.boolean().describe("Show Incorrect Answers").default(true),
    }).describe("Settings"),
});

export type MultipleChoiceContent = z.infer<typeof schema>;
