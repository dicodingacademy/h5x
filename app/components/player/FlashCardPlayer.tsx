import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { FlashCardContent } from "~/registry/flash-card/schema";

export function FlashCardPlayer({ data }: { data: FlashCardContent }) {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="w-full max-w-md mx-auto [perspective:1000px]">
            <div
                className={`relative w-full aspect-[4/3] transition-all duration-500 [transform-style:preserve-3d] cursor-pointer`}
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
                {/* Front */}
                <Card className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="space-y-4">
                        {data.imageUrl && (
                            <img
                                src={data.imageUrl}
                                alt="Question"
                                className="w-32 h-32 object-contain mx-auto rounded-md"
                            />
                        )}
                        <h3 className="text-2xl font-bold">{data.question}</h3>
                        <p className="text-sm text-muted-foreground mt-4">Click to flip</p>
                    </CardContent>
                </Card>

                {/* Back */}
                <Card
                    className="absolute inset-0 w-full h-full [backface-visibility:hidden] flex flex-col items-center justify-center p-6 text-center shadow-lg bg-primary text-primary-foreground"
                    style={{ transform: "rotateY(180deg)" }}
                >
                    <CardContent>
                        <h3 className="text-2xl font-bold">{data.answer}</h3>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm" onClick={() => setIsFlipped(false)}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset Card
                </Button>
            </div>
        </div>
    );
}
