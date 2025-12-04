import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { db } from "~/db";
import { contents } from "~/db/schema";
import { desc } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import type { Route } from "./+types/show";

// Player Imports
import { MultipleChoicePlayer } from "~/components/player/MultipleChoicePlayer";
import { TrueFalsePlayer } from "~/components/player/TrueFalsePlayer";
import { InteractiveVideoPlayer } from "~/components/player/InteractiveVideoPlayer";
import { FlashCardPlayer } from "~/components/player/FlashCardPlayer";
import { FillBlankPlayer } from "~/components/player/FillBlankPlayer";
import { ImageHotspotPlayer } from "~/components/player/ImageHotspotPlayer";

export async function loader({ request }: Route.LoaderArgs) {
    const projects = await db
        .select()
        .from(contents)
        .orderBy(desc(contents.updatedAt));

    return { projects };
}

export default function Show({ loaderData }: Route.ComponentProps) {
    const { projects } = loaderData;
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get current index from URL or default to 0
    const currentIndex = parseInt(searchParams.get("index") || "0");
    const currentProject = projects[currentIndex];

    // Ensure index is valid
    useEffect(() => {
        if (projects.length > 0 && (currentIndex < 0 || currentIndex >= projects.length)) {
            navigate(`?index=0`, { replace: true });
        }
    }, [currentIndex, projects.length, navigate]);

    const handleNext = () => {
        if (currentIndex < projects.length - 1) {
            navigate(`?index=${currentIndex + 1}`);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            navigate(`?index=${currentIndex - 1}`);
        }
    };

    // Helper to format type name
    const formatType = (type: string | null) => {
        if (!type) return "Draft";
        return type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
    };

    if (projects.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                    <Play className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm text-center">
                    Create your first interactive content in the editor to see it displayed here.
                </p>
                <Button asChild>
                    <Link to="/">Go to Editor</Link>
                </Button>
            </div>
        );
    }

    if (!currentProject) return null;

    return (
        <div className="h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background sticky top-0 z-10">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to="/">Home</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Showcase</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-muted-foreground mr-2">
                        {currentIndex + 1} of {projects.length}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handlePrevious}
                        disabled={currentIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={handleNext}
                        disabled={currentIndex === projects.length - 1}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 w-full">
                <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline">{formatType(currentProject.type)}</Badge>
                            <span className="text-sm text-muted-foreground">
                                Last updated: {new Date(currentProject.updatedAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">{currentProject.title}</h1>
                    </div>

                    <Card className="overflow-hidden border-2 shadow-sm h-[600px] flex flex-col">
                        <CardContent className="p-0 flex-1 relative">
                            <ScrollArea className="h-full w-full absolute inset-0">
                                <div className="w-full max-w-3xl mx-auto p-8 min-h-full flex flex-col items-center justify-center">
                                    {currentProject.content ? (
                                        <>
                                            {currentProject.type === "multiple-choice" && <MultipleChoicePlayer data={currentProject.content} />}
                                            {currentProject.type === "true-false" && <TrueFalsePlayer data={currentProject.content} />}
                                            {currentProject.type === "interactive-video" && <InteractiveVideoPlayer data={currentProject.content} />}
                                            {currentProject.type === "flash-card" && <FlashCardPlayer data={currentProject.content} />}
                                            {currentProject.type === "fill-blank" && <FillBlankPlayer data={currentProject.content} />}
                                            {currentProject.type === "image-hotspot" && <ImageHotspotPlayer data={currentProject.content} />}
                                        </>
                                    ) : (
                                        <div className="text-center py-20 text-muted-foreground">
                                            <p>This project has no content yet.</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <div className="flex justify-between items-center pt-4">
                        <Button
                            variant="ghost"
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="gap-2"
                        >
                            <ChevronLeft className="h-4 w-4" /> Previous Project
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={currentIndex === projects.length - 1}
                            className="gap-2"
                        >
                            Next Project <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
