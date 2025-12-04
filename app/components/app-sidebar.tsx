import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "~/components/ui/sidebar"

import { Plus, FileText, Layout } from "lucide-react"
import { Link, useSearchParams, useLocation } from "react-router"

interface Project {
    id: number;
    title: string;
    type: string | null;
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    projects: Project[];
}

export function AppSidebar({ projects, ...props }: AppSidebarProps) {
    const [searchParams] = useSearchParams();
    const currentProjectId = searchParams.get("projectId");
    const location = useLocation();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link to="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Layout className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">h5x</span>
                                    <span className="truncate text-xs">Editor</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton asChild tooltip="New Project">
                                <Link to="/">
                                    <Plus />
                                    <span>New Project</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel>Projects</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {projects.length === 0 ? (
                                <div className="px-2 py-2 text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                                    No projects yet.
                                </div>
                            ) : (
                                projects.map((project) => (
                                    <SidebarMenuItem key={project.id}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={currentProjectId === project.id.toString()}
                                            tooltip={project.title}
                                        >
                                            <Link to={`/?projectId=${project.id}`}>
                                                <FileText />
                                                <span>{project.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <div className="p-4 text-xs text-center text-muted-foreground group-data-[collapsible=icon]:hidden">
                    v0.1.0 Alpha
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
