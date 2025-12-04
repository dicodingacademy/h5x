import { useFormContext, useFieldArray } from "react-hook-form";
import { useRef } from "react";
import type { MouseEvent } from "react";
import { Button } from "~/components/ui/button";
import { Trash2 } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card } from "~/components/ui/card";

export function HotspotEditor({ path }: { path: string }) {
    const { watch, control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: path,
    });

    const parentPath = path.split('.').slice(0, -1).join('.');
    const imagePath = parentPath ? `${parentPath}.image` : 'image';
    const image = watch(imagePath);

    const imageRef = useRef<HTMLImageElement>(null);

    const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!imageRef.current) return;

        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        append({
            x: Math.round(x),
            y: Math.round(y),
            title: "New Hotspot",
            description: "Description here",
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative w-full rounded-lg overflow-hidden border bg-muted">
                {image ? (
                    <div className="relative cursor-crosshair group" onClick={handleImageClick}>
                        <img
                            ref={imageRef}
                            src={image}
                            alt="Hotspot Background"
                            className="w-full h-auto object-contain"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                        {fields.map((field: any, index) => (
                            <div
                                key={field.id}
                                className="absolute w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none border-2 border-white"
                                style={{ left: `${watch(`${path}.${index}.x`)}%`, top: `${watch(`${path}.${index}.y`)}%` }}
                            >
                                {index + 1}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-40 flex items-center justify-center text-muted-foreground flex-col gap-2">
                        <p>Upload an image first to add hotspots</p>
                    </div>
                )}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label>Hotspots List ({fields.length})</Label>
                    <p className="text-xs text-muted-foreground">Click on image to add points</p>
                </div>

                <div className="space-y-3">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-1">
                                    {index + 1}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label className="text-xs">X Position (%)</Label>
                                            <Input
                                                type="number"
                                                {...register(`${path}.${index}.x`, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Y Position (%)</Label>
                                            <Input
                                                type="number"
                                                {...register(`${path}.${index}.y`, { valueAsNumber: true })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Title</Label>
                                        <Input {...register(`${path}.${index}.title`)} placeholder="Hotspot Title" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Description</Label>
                                        <Input {...register(`${path}.${index}.description`)} placeholder="Description" />
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => remove(index)}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-1 -mr-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}

                    {fields.length === 0 && (
                        <div className="text-center p-4 border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                            No hotspots added yet. Click on the image above to add one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
