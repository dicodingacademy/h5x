import { Link, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Plus, FileText, Layout } from "lucide-react";
import { cn } from "~/lib/utils";

interface Project {
    id: number;
    title: string;
    type: string | null;
}

interface SidebarProps {
    projects: Project[];
}

export function Sidebar({ projects }: SidebarProps) {
    const [searchParams] = useSearchParams();
    const currentProjectId = searchParams.get("projectId");

    return (
        <div className="w-64 border-r bg-gray-50/50 dark:bg-gray-900/50 flex flex-col h-full">
            <div className="p-4 border-b">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl px-2">
                    <Layout className="h-6 w-6 text-primary" />
                    <span>h5x</span>
                </Link>
            </div>

            <div className="p-4">
                <Link to="/">
                    <Button className="w-full justify-start" variant={!currentProjectId ? "secondary" : "outline"}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Project
                    </Button>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2">
                <div className="space-y-1">
                    <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Your Projects
                    </h3>
                    {projects.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                            No projects yet.
                        </div>
                    ) : (
                        projects.map((project) => (
                            <Link key={project.id} to={`/?projectId=${project.id}`}>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start font-normal",
                                        currentProjectId === project.id.toString() && "bg-accent text-accent-foreground font-medium"
                                    )}
                                >
                                    <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{project.title}</span>
                                </Button>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            <div className="p-4 border-t text-xs text-center text-muted-foreground">
                v0.1.0 Alpha
            </div>
        </div>
    );
}
