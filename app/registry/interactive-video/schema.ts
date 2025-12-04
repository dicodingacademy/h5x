import { z } from "zod";

export const schema = z.object({
    title: z.string().describe("Video Title").default("My Interactive Video"),
    videoUrl: z.string().url().describe("Video URL (HLS/m3u8)").default("https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8"),
    settings: z.object({
        preventSeeking: z.boolean().describe("Prevent Seeking").default(false),
        requireCompletion: z.boolean().describe("Require Completion").default(true),
        autoPlay: z.boolean().describe("Auto Play").default(false),
    }).describe("Settings"),
    interactions: z.array(
        z.object({
            time: z.number().min(0).describe("Time (seconds)"),
            type: z.enum(["fact", "quiz"]).describe("Interaction Type"),
            // We use a flat structure for simplicity in the generic form builder for now
            // In a real app, we might want a discriminated union, but that requires FormBuilder support
            factContent: z.object({
                title: z.string().default("Did you know?").describe("Fact Title"),
                description: z.string().default("Here is an interesting fact.").describe("Fact Description"),
            }).describe("Fact Content (Only if Type is Fact)").optional(),
            quizContent: z.object({
                question: z.string().default("What is the answer?").describe("Question"),
                answers: z.array(
                    z.object({
                        text: z.string().describe("Answer Text"),
                        correct: z.boolean().default(false).describe("Is Correct"),
                    })
                ).default([
                    { text: "Option A", correct: true },
                    { text: "Option B", correct: false }
                ]).describe("Answers"),
            }).describe("Quiz Content (Only if Type is Quiz)").optional(),
        })
    ).refine((interactions) => {
        const sorted = [...interactions].sort((a, b) => a.time - b.time);
        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i + 1].time - sorted[i].time < 5) {
                return false;
            }
        }
        return true;
    }, { message: "Interactions must be at least 5 seconds apart." }).describe("Interactions (Time-based events)"),
});

export type InteractiveVideoContent = z.infer<typeof schema>;
