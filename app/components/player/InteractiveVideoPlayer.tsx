import { useState, useRef } from "react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
    DefaultVideoLayout,
    defaultLayoutIcons,
} from "@vidstack/react/player/layouts/default";
import "@vidstack/react/player/styles/default/theme.css";
import "@vidstack/react/player/styles/default/layouts/video.css";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import type { InteractiveVideoContent } from "~/registry/interactive-video/schema";

export function InteractiveVideoPlayer({
    data,
}: {
    data: InteractiveVideoContent;
}) {
    const player = useRef<any>(null);
    const [activeInteraction, setActiveInteraction] = useState<any>(null);
    const [processedInteractions, setProcessedInteractions] = useState<Set<number>>(new Set());
    const [quizSelected, setQuizSelected] = useState<number | null>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);

    // Sort interactions by time
    const interactions = data.interactions?.sort((a, b) => a.time - b.time) || [];

    const lastTimeRef = useRef(0);

    const handleTimeUpdate = (detail: any) => {
        const currentTime = detail.currentTime;

        // Prevent seeking logic
        if (data.settings?.preventSeeking) {
            // Allow a small buffer (e.g., 1 second) for normal playback progression
            if (currentTime > lastTimeRef.current + 1) {
                if (player.current) {
                    player.current.currentTime = lastTimeRef.current;
                }
                return;
            }
            lastTimeRef.current = Math.max(lastTimeRef.current, currentTime);
        }

        // Find an interaction that matches the current time (within 0.5s) and hasn't been processed
        const interaction = interactions.find(
            (i) => Math.abs(i.time - currentTime) < 0.5 && !processedInteractions.has(i.time)
        );

        if (interaction) {
            player.current?.pause();
            setActiveInteraction(interaction);
            setProcessedInteractions((prev) => new Set(prev).add(interaction.time));
        }
    };

    const handleContinue = () => {
        setActiveInteraction(null);
        setQuizSelected(null);
        setQuizSubmitted(false);
        player.current?.play();
    };

    const handleQuizSubmit = () => {
        setQuizSubmitted(true);
    };

    const isCorrect = activeInteraction?.type === "quiz" &&
        activeInteraction.quizContent?.answers?.[quizSelected!]?.correct;

    return (
        <div className="w-full mx-auto space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <MediaPlayer
                    ref={player}
                    title={data.title}
                    src={data.videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    className="w-full h-full"
                    autoplay={data.settings?.autoPlay}
                >
                    <MediaProvider />
                    <DefaultVideoLayout
                        icons={defaultLayoutIcons}
                        slots={{
                            timeSlider: data.settings?.preventSeeking ? null : undefined,
                        }}
                    />

                    {/* Interaction Overlay (Modal) */}
                    {activeInteraction && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                            <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        {activeInteraction.type === "fact" ? (
                                            <Info className="h-5 w-5 text-blue-500" />
                                        ) : (
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        )}
                                        <CardTitle>
                                            {activeInteraction.type === "fact"
                                                ? activeInteraction.factContent?.title
                                                : "Quiz Time!"}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {activeInteraction.type === "fact" && (
                                        <>
                                            <p className="text-muted-foreground">
                                                {activeInteraction.factContent?.description}
                                            </p>
                                            <Button onClick={handleContinue} className="w-full">
                                                Continue Video
                                            </Button>
                                        </>
                                    )}

                                    {activeInteraction.type === "quiz" && (
                                        <div className="space-y-4">
                                            <p className="font-medium text-lg">
                                                {activeInteraction.quizContent?.question}
                                            </p>
                                            <div className="grid gap-2">
                                                {activeInteraction.quizContent?.answers?.map((answer: any, index: number) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => !quizSubmitted && setQuizSelected(index)}
                                                        disabled={quizSubmitted}
                                                        className={`
                                                            w-full text-left p-3 rounded-md border transition-all flex items-center justify-between
                                                            ${quizSelected === index
                                                                ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                                : "border-muted hover:bg-muted/50"}
                                                            ${quizSubmitted && answer.correct ? "bg-green-100 border-green-500 text-green-800" : ""}
                                                            ${quizSubmitted && quizSelected === index && !answer.correct ? "bg-red-100 border-red-500 text-red-800" : ""}
                                                        `}
                                                    >
                                                        <span>{answer.text}</span>
                                                        {quizSubmitted && answer.correct && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                        {quizSubmitted && quizSelected === index && !answer.correct && <XCircle className="h-4 w-4 text-red-600" />}
                                                    </button>
                                                ))}
                                            </div>

                                            {!quizSubmitted ? (
                                                <Button
                                                    onClick={handleQuizSubmit}
                                                    disabled={quizSelected === null}
                                                    className="w-full"
                                                >
                                                    Check Answer
                                                </Button>
                                            ) : (
                                                <div className="space-y-2">
                                                    {isCorrect ? (
                                                        <>
                                                            <div className="p-2 bg-green-100 text-green-800 rounded text-center text-sm font-medium">
                                                                Correct! Great job.
                                                            </div>
                                                            <Button onClick={handleContinue} className="w-full">
                                                                Continue Video
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="p-2 bg-red-100 text-red-800 rounded text-center text-sm font-medium">
                                                                Incorrect. Please try again.
                                                            </div>
                                                            <Button
                                                                onClick={() => {
                                                                    setQuizSubmitted(false);
                                                                    setQuizSelected(null);
                                                                }}
                                                                className="w-full"
                                                                variant="secondary"
                                                            >
                                                                Try Again
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </MediaPlayer>
            </div>
        </div >
    );
}
