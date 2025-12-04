import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Trash2, Plus } from "lucide-react";

interface FormBuilderProps {
    schema: z.ZodObject<any>;
    path?: string;
}

export function FormBuilder({ schema, path = "", className }: FormBuilderProps & { className?: string }) {
    const shape = schema.shape;

    return (
        <div className={className || "space-y-3"}>
            {Object.entries(shape).map(([key, value]) => {
                const fieldPath = path ? `${path}.${key}` : key;
                const fieldSchema = value as z.ZodTypeAny;

                return (
                    <FieldRenderer
                        key={key}
                        name={key}
                        path={fieldPath}
                        schema={fieldSchema}
                    />
                );
            })}
        </div>
    );
}

function FieldRenderer({
    name,
    path,
    schema,
}: {
    name: string;
    path: string;
    schema: z.ZodTypeAny;
}) {
    const { register, watch, setValue } = useFormContext();

    // Unwrap ZodDefault / ZodOptional to get the underlying type
    let underlyingSchema = schema;
    while (underlyingSchema instanceof z.ZodDefault || underlyingSchema instanceof z.ZodOptional) {
        if (underlyingSchema instanceof z.ZodDefault) {
            underlyingSchema = underlyingSchema._def.innerType as z.ZodTypeAny;
        } else if (underlyingSchema instanceof z.ZodOptional) {
            underlyingSchema = underlyingSchema.unwrap() as z.ZodTypeAny;
        }
    }

    const description = (schema as any).description || (underlyingSchema as any).description;

    // Handle ZodString
    if (underlyingSchema instanceof z.ZodString) {
        return (
            <div className="space-y-2 w-full">
                <Label htmlFor={path} className="capitalize">
                    {name}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <Input id={path} {...register(path)} />
            </div>
        );
    }

    // Handle ZodNumber
    if (underlyingSchema instanceof z.ZodNumber) {
        return (
            <div className="space-y-2 w-full">
                <Label htmlFor={path} className="capitalize">
                    {name}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <Input
                    id={path}
                    type="number"
                    {...register(path, { valueAsNumber: true })}
                />
            </div>
        );
    }

    // Handle ZodBoolean
    if (underlyingSchema instanceof z.ZodBoolean) {
        // For boolean, we need to manually handle the switch state
        const value = watch(path);

        // Handle default value if undefined
        React.useEffect(() => {
            if (value === undefined && (schema as any)._def.defaultValue) {
                setValue(path, (schema as any)._def.defaultValue());
            }
        }, [value, path, schema, setValue]);

        if (name === "correct") {
            return (
                <div className="flex items-center gap-2">
                    <Label htmlFor={path} className="capitalize text-sm font-normal">
                        {name}
                    </Label>
                    <Switch
                        id={path}
                        checked={!!value}
                        onCheckedChange={(checked) => setValue(path, checked)}
                    />
                </div>
            );
        }

        return (
            <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                    <Label htmlFor={path} className="capitalize">
                        {description}
                    </Label>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                <Switch
                    id={path}
                    checked={!!value}
                    onCheckedChange={(checked) => setValue(path, checked)}
                />
            </div>
        );
    }

    // Handle ZodArray
    if (underlyingSchema instanceof z.ZodArray) {
        return <ArrayField name={name} path={path} schema={underlyingSchema} />;
    }

    // Handle ZodObject (Recursive)
    if (underlyingSchema instanceof z.ZodObject) {
        return (
            <Card className="shadow-none border-dashed m-0 p-0 space-y-0">
                <CardContent className="p-4 pt-4">
                    <FormBuilder schema={underlyingSchema} path={path} />
                </CardContent>
            </Card>
        )
    }

    return <div>Unsupported field type: {name}</div>;
}

function ArrayField({
    name,
    path,
    schema,
}: {
    name: string;
    path: string;
    schema: z.ZodArray<any>;
}) {
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: path,
    });

    const itemSchema = schema.element;

    const isAnswers = name === "answers";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between py-4">
                <Label className="capitalize text-lg font-semibold">{name}</Label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({})}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                </Button>
            </div>

            <div className={isAnswers ? "space-y-2" : "space-y-3"}>
                {fields.map((field, index) => {
                    if (isAnswers) {
                        return (
                            <div key={field.id} className="group flex items-center gap-2">
                                <div className="flex-1">
                                    {itemSchema instanceof z.ZodObject ? (
                                        <FormBuilder
                                            schema={itemSchema}
                                            path={`${path}.${index}`}
                                            className="flex items-center gap-4 w-full"
                                        />
                                    ) : (
                                        <FieldRenderer
                                            name={`Item ${index + 1}`}
                                            path={`${path}.${index}`}
                                            schema={itemSchema}
                                        />
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/90 h-8 w-8"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        );
                    }

                    return (
                        <Card key={field.id} className="relative group">
                            <CardContent className="p-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-2 text-destructive hover:text-destructive/90 h-6 w-6"
                                    onClick={() => remove(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>

                                {itemSchema instanceof z.ZodObject ? (
                                    <FormBuilder
                                        schema={itemSchema}
                                        path={`${path}.${index}`}
                                    />
                                ) : (
                                    <FieldRenderer
                                        name={`Item ${index + 1}`}
                                        path={`${path}.${index}`}
                                        schema={itemSchema}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
