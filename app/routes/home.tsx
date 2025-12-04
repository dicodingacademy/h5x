import { useState, useEffect, useMemo } from "react";
import { Form, useNavigation, useSubmit, redirect, useActionData } from "react-router";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "~/db";
import { contents } from "~/db/schema";
import { eq, desc } from "drizzle-orm";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "~/components/ui/resizable";
import { ScrollArea } from "~/components/ui/scroll-area";
import { FormBuilder } from "~/components/editor/FormBuilder";
import { schema as multipleChoiceSchema } from "~/registry/multiple-choice/schema";
import { MultipleChoicePlayer } from "~/components/player/MultipleChoicePlayer";
import { schema as trueFalseSchema } from "~/registry/true-false/schema";
import { TrueFalsePlayer } from "~/components/player/TrueFalsePlayer";
import { schema as interactiveVideoSchema } from "~/registry/interactive-video/schema";
import { InteractiveVideoPlayer } from "~/components/player/InteractiveVideoPlayer";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";
import { Separator } from "~/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import type { Route } from "./+types/home";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");

  // Fetch all projects for sidebar
  const projects = await db
    .select({ id: contents.id, title: contents.title, type: contents.type })
    .from(contents)
    .orderBy(desc(contents.updatedAt));

  let currentProject = null;
  if (projectId) {
    currentProject = await db
      .select()
      .from(contents)
      .where(eq(contents.id, parseInt(projectId)))
      .get();
  }

  return { projects, currentProject };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create_project") {
    const title = formData.get("title") as string;
    const result = await db
      .insert(contents)
      .values({ title, type: null, content: null })
      .returning({ id: contents.id });
    throw redirect(`/?projectId=${result[0].id}`);
  }

  if (intent === "select_type") {
    const projectId = formData.get("projectId") as string;
    const type = formData.get("type") as string;
    await db
      .update(contents)
      .set({ type })
      .where(eq(contents.id, parseInt(projectId)));
    return { success: true };
  }

  if (intent === "save_content") {
    const projectId = formData.get("projectId") as string;
    const content = formData.get("content") as string;
    await db
      .update(contents)
      .set({ content: JSON.parse(content) })
      .where(eq(contents.id, parseInt(projectId)));
    return { success: true, saved: true };
  }

  if (intent === "delete_project") {
    const projectId = formData.get("projectId") as string;
    await db.delete(contents).where(eq(contents.id, parseInt(projectId)));
    throw redirect("/");
  }

  return null;
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { projects, currentProject } = loaderData;

  return (
    <SidebarProvider>
      <AppSidebar projects={projects} />
      <SidebarInset>
        {currentProject ? (
          <ProjectWorkspace project={currentProject} />
        ) : (
          <>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage>Home</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <EmptyState />
          </>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}

function EmptyState() {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Start building your interactive content</CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="create_project" />
            <div className="space-y-2">
              <Input
                name="title"
                placeholder="Project Title (e.g., Math Quiz 101)"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create Project
            </Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectWorkspace({ project }: { project: any }) {
  const submit = useSubmit();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const confirmDelete = () => {
    const formData = new FormData();
    formData.append("intent", "delete_project");
    formData.append("projectId", project.id.toString());
    submit(formData, { method: "post" });
    setIsDeleteDialogOpen(false);
  };

  if (!project.type) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Project</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the project
                <span className="font-semibold text-foreground"> "{project.title}" </span>
                and remove all its data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
              >
                Delete Project
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-4xl mt-8">
            <CardHeader>
              <CardTitle>Select Content Type</CardTitle>
              <CardDescription>Choose the type of interaction for "{project.title}"</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => {
                  const formData = new FormData();
                  formData.append("intent", "select_type");
                  formData.append("projectId", project.id.toString());
                  formData.append("type", "multiple-choice");
                  submit(formData, { method: "post" });
                }}
              >
                <span className="text-lg font-semibold">Multiple Choice</span>
                <span className="text-sm text-muted-foreground">Standard quiz format</span>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => {
                  const formData = new FormData();
                  formData.append("intent", "select_type");
                  formData.append("projectId", project.id.toString());
                  formData.append("type", "true-false");
                  submit(formData, { method: "post" });
                }}
              >
                <span className="text-lg font-semibold">True / False</span>
                <span className="text-sm text-muted-foreground">Simple binary choice</span>
              </Button>
              <Button
                variant="outline"
                className="h-32 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
                onClick={() => {
                  const formData = new FormData();
                  formData.append("intent", "select_type");
                  formData.append("projectId", project.id.toString());
                  formData.append("type", "interactive-video");
                  submit(formData, { method: "post" });
                }}
              >
                <span className="text-lg font-semibold">Interactive Video</span>
                <span className="text-sm text-muted-foreground">Video with timed events</span>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              <span className="font-semibold text-foreground"> "{project.title}" </span>
              and remove all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground text-white hover:bg-destructive/90"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Editor project={project} onDelete={() => setIsDeleteDialogOpen(true)} />
    </>
  );
}

function Editor({ project, onDelete }: { project: any, onDelete: () => void }) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const actionData = useActionData<typeof action>();
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (actionData?.saved) {
      toast.success("Project saved successfully!");
    }
  }, [actionData]);

  // Determine schema and defaults based on type
  const { schema, defaultValues } = useMemo(() => {
    if (project.type === "true-false") {
      return {
        schema: trueFalseSchema,
        defaultValues: project.content || {
          question: "True or False Question",
          correctResponse: true,
          feedbackOnCorrect: "Correct!",
          feedbackOnIncorrect: "Incorrect",
        },
      };
    } else if (project.type === "interactive-video") {
      return {
        schema: interactiveVideoSchema,
        defaultValues: project.content || {
          title: "My Interactive Video",
          videoUrl: "https://stream.mux.com/VZtzUzGRv02OhRnZCxcNg49OilvolTqdnFLEqBsTwaxU.m3u8",
          settings: { preventSeeking: false, requireCompletion: true, autoPlay: false },
          interactions: [
            {
              time: 5,
              type: "fact",
              factContent: { title: "Did you know?", description: "This is a fact appearing at 5 seconds." }
            },
            {
              time: 10,
              type: "quiz",
              quizContent: {
                question: "What did you just see?",
                answers: [{ text: "Option A", correct: true }, { text: "Option B", correct: false }]
              }
            }
          ]
        },
      };
    } else {
      return {
        schema: multipleChoiceSchema,
        defaultValues: project.content || {
          title: "My Quiz",
          settings: {
            passingScore: 80,
            showIncorrectAnswers: true
          },
          questions: [
            {
              text: "Question 1",
              answers: [{ text: "Option 1", correct: false }, { text: "Option 2", correct: true }]
            }
          ],
        },
      };
    }
  }, [project.type, project.content]);

  // Initialize form with existing content or defaults
  const methods = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onChange",
  });

  // Reset form when project changes or content is loaded
  const projectId = project.id;
  useEffect(() => {
    methods.reset(defaultValues);
  }, [projectId, defaultValues, methods]);

  const { watch } = methods;
  const formData = watch(); // Live preview data

  const handleSave = (data: any) => {
    const formData = new FormData();
    formData.append("intent", "save_content");
    formData.append("projectId", project.id.toString());
    formData.append("content", JSON.stringify(data));
    submit(formData, { method: "post" });
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Project</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{project.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="ml-2 text-xs text-muted-foreground uppercase tracking-wider font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
            {project.type}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="mr-2"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-2">
            <Trash2 className="h-5 w-5" />
          </Button>
          <Button
            onClick={methods.handleSubmit(handleSave)}
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Project
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <FormProvider {...methods} key={projectId}>
          <ResizablePanelGroup direction="horizontal">
            {/* Left: Form Editor */}
            <ResizablePanel defaultSize={showPreview ? 40 : 100} minSize={30}>
              <ScrollArea className="h-full bg-gray-50/50 dark:bg-gray-900/50">
                <div className="p-4 max-w-xl mx-auto space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Content Editor
                    </h2>
                  </div>
                  <FormBuilder schema={schema} />
                </div>
              </ScrollArea>
            </ResizablePanel>

            {showPreview && (
              <>
                <ResizableHandle />

                {/* Right: Preview */}
                <ResizablePanel defaultSize={60}>
                  <div className="h-full bg-gray-100 dark:bg-gray-950 p-4 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Live Preview
                      </h2>
                    </div>
                    <div className="flex-1 flex justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 overflow-hidden">
                      <ScrollArea className="w-full h-full">
                        <div className="w-full h-full flex flex-col items-center justify-center p-4 min-h-[500px]">
                          <div className="w-full max-w-3xl">
                            {project.type === "multiple-choice" && (
                              <MultipleChoicePlayer data={formData} />
                            )}
                            {project.type === "true-false" && (
                              <TrueFalsePlayer data={formData} />
                            )}
                            {project.type === "interactive-video" && (
                              <InteractiveVideoPlayer data={formData} />
                            )}
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </FormProvider>
      </div>
    </div>
  );
}
