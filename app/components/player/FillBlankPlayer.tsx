import { useState, useMemo } from "react";
import {
    DndContext,
    DragOverlay,
    useDraggable,
    useDroppable,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { FillBlankContent } from "~/registry/fill-blank/schema";

interface DraggableItem {
    id: string;
    text: string;
}

function Draggable({ id, text, isDropped }: { id: string; text: string; isDropped: boolean }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
        disabled: isDropped,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    if (isDropped) return null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-md cursor-grab active:cursor-grabbing shadow-sm text-sm font-medium ${isDragging ? "opacity-50" : ""}`}
        >
            {text}
        </div>
    );
}

function Droppable({ id, droppedItem, isCorrect, showFeedback }: { id: string; droppedItem?: DraggableItem; isCorrect?: boolean; showFeedback: boolean }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={`inline-flex items-center justify-center min-w-[80px] h-8 mx-1 border-b-2 transition-colors ${isOver ? "border-primary bg-primary/10" : "border-muted-foreground/30"} ${droppedItem ? "bg-secondary" : ""} ${showFeedback && isCorrect ? "border-green-500 bg-green-100" : ""} ${showFeedback && !isCorrect && droppedItem ? "border-red-500 bg-red-100" : ""}`}
        >
            {droppedItem ? (
                <span className="px-2 text-sm font-medium">{droppedItem.text}</span>
            ) : null}
        </div>
    );
}

export function FillBlankPlayer({ data }: { data: FillBlankContent }) {
    const [droppedItems, setDroppedItems] = useState<Record<string, DraggableItem>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Parse text to find blanks *word*
    const { parts, blanks } = useMemo(() => {
        const regex = /\*([^*]+)\*/g;
        const parts = [];
        const blanks = [];
        let lastIndex = 0;
        let match;
        let blankIndex = 0;

        while ((match = regex.exec(data.text)) !== null) {
            // Add text before the blank
            if (match.index > lastIndex) {
                parts.push({ type: "text", content: data.text.substring(lastIndex, match.index) });
            }

            // Add the blank
            const answer = match[1];
            const id = `blank-${blankIndex}`;
            parts.push({ type: "blank", id, answer });
            blanks.push({ id, answer });
            blankIndex++;

            lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < data.text.length) {
            parts.push({ type: "text", content: data.text.substring(lastIndex) });
        }

        return { parts, blanks };
    }, [data.text]);

    // Prepare draggable items (answers + distractors)
    const draggables = useMemo(() => {
        const items = [
            ...blanks.map((b, i) => ({ id: `item-${b.answer}-${i}`, text: b.answer })),
            ...(data.distractors || []).map((d, i) => ({ id: `distractor-${i}`, text: d.text })),
        ];
        // Shuffle items
        return items.sort(() => Math.random() - 0.5);
    }, [blanks, data.distractors]);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (over && active) {
            const blankId = over.id as string;
            const item = draggables.find((i) => i.id === active.id);

            if (item) {
                setDroppedItems((prev) => ({
                    ...prev,
                    [blankId]: item,
                }));
            }
        }
    };

    const handleCheck = () => {
        setIsSubmitted(true);
    };

    const handleReset = () => {
        setDroppedItems({});
        setIsSubmitted(false);
    };

    const score = blanks.reduce((acc, blank) => {
        const dropped = droppedItems[blank.id];
        return acc + (dropped && dropped.text === blank.answer ? 1 : 0);
    }, 0);

    return (
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className="w-full max-w-2xl mx-auto space-y-6">
                <Card>
                    <CardContent className="p-6 leading-loose text-lg">
                        {parts.map((part, index) => {
                            if (part.type === "text") {
                                return <span key={index}>{part.content}</span>;
                            } else {
                                const isCorrect = droppedItems[part.id]?.text === part.answer;
                                return (
                                    <Droppable
                                        key={part.id}
                                        id={part.id!}
                                        droppedItem={droppedItems[part.id!]}
                                        isCorrect={isCorrect}
                                        showFeedback={isSubmitted}
                                    />
                                );
                            }
                        })}
                    </CardContent>
                </Card>

                <div className="flex flex-wrap gap-2 justify-center min-h-[3rem]">
                    {draggables.map((item) => {
                        // Check if item is already dropped
                        const isDropped = Object.values(droppedItems).some((i) => i.id === item.id);
                        return (
                            <Draggable
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                isDropped={isDropped}
                            />
                        );
                    })}
                </div>

                <div className="flex justify-center gap-4">
                    {!isSubmitted ? (
                        <Button onClick={handleCheck} disabled={Object.keys(droppedItems).length === 0}>
                            Check Answer
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <div className="text-lg font-semibold">
                                Score: {score} / {blanks.length}
                            </div>
                            <Button variant="outline" onClick={handleReset}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Try Again
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            <DragOverlay>
                {activeId ? (
                    <div className="inline-flex items-center justify-center px-3 py-1 bg-primary text-primary-foreground rounded-md shadow-lg text-sm font-medium opacity-80">
                        {draggables.find((i) => i.id === activeId)?.text}
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
