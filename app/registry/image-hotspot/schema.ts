import { z } from "zod";

export const schema = z.object({
    image: z.string().describe("Image (Upload or URL)"),
    hotspots: z.array(z.object({
        x: z.number().min(0).max(100).default(50).describe("X Position (%)"),
        y: z.number().min(0).max(100).default(50).describe("Y Position (%)"),
        title: z.string().default("Hotspot Title").describe("Title"),
        description: z.string().default("Description of this hotspot.").describe("Description"),
    })).default([]).describe("Hotspots"),
});

export type ImageHotspotContent = z.infer<typeof schema>;
