import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "../ui/popover";
import { Button } from "~/components/ui/button";
import { Info } from "lucide-react";
import type { ImageHotspotContent } from "~/registry/image-hotspot/schema";

export function ImageHotspotPlayer({ data }: { data: ImageHotspotContent }) {
    if (!data.image) {
        return (
            <div className="flex items-center justify-center h-64 bg-muted rounded-lg border-2 border-dashed">
                <p className="text-muted-foreground">No image selected</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="relative w-full rounded-lg overflow-hidden shadow-lg bg-black/5">
                <img
                    src={data.image}
                    alt="Hotspot Image"
                    className="w-full h-auto object-contain"
                />

                {data.hotspots.map((hotspot, index) => (
                    <Popover key={index}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="default"
                                size="icon"
                                className="absolute w-8 h-8 rounded-full shadow-md hover:scale-110 transition-transform z-10"
                                style={{
                                    left: `${hotspot.x}%`,
                                    top: `${hotspot.y}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                <Info className="w-5 h-5" />
                                <span className="sr-only">{hotspot.title}</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">{hotspot.title}</h4>
                                <p className="text-sm text-muted-foreground">
                                    {hotspot.description}
                                </p>
                            </div>
                        </PopoverContent>
                    </Popover>
                ))}
            </div>
        </div>
    );
}
