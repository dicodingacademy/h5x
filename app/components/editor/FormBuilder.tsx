import React from "react";
import { useFormContext, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Trash2, Plus } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "~/components/ui/select";

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
    const { register, watch, setValue, formState: { errors } } = useFormContext();

    // Unwrap ZodDefault / ZodOptional / ZodUnion to get the underlying type
    let underlyingSchema = schema;
    while (
        underlyingSchema instanceof z.ZodDefault ||
        underlyingSchema instanceof z.ZodOptional ||
        underlyingSchema instanceof z.ZodUnion
    ) {
        if (underlyingSchema instanceof z.ZodDefault) {
            underlyingSchema = underlyingSchema._def.innerType as z.ZodTypeAny;
        } else if (underlyingSchema instanceof z.ZodOptional) {
            underlyingSchema = underlyingSchema.unwrap() as z.ZodTypeAny;
        } else if (underlyingSchema instanceof z.ZodUnion) {
            // For unions, we try to find a supported type (String, Number, Boolean)
            // We need to unwrap optionals/defaults inside the union options too
            const options = underlyingSchema.options;
            let foundType: z.ZodTypeAny | null = null;

            for (const opt of options) {
                let inner = opt;
                while (inner instanceof z.ZodDefault || inner instanceof z.ZodOptional) {
                    if (inner instanceof z.ZodDefault) {
                        inner = inner._def.innerType;
                    } else if (inner instanceof z.ZodOptional) {
                        inner = inner.unwrap();
                    }
                }

                if (
                    inner instanceof z.ZodString ||
                    inner instanceof z.ZodNumber ||
                    inner instanceof z.ZodBoolean ||
                    inner instanceof z.ZodEnum
                ) {
                    foundType = inner;
                    break;
                }
            }

            if (foundType) {
                underlyingSchema = foundType;
            } else {
                break; // Cannot resolve union to a simple type
            }
        }
    }

    // Conditional visibility for Interactive Video interactions
    if (name === "factContent") {
        const parentPath = path.split('.').slice(0, -1).join('.');
        const typePath = `${parentPath}.type`;
        const typeValue = watch(typePath);
        if (typeValue !== "fact") return null;
    }

    if (name === "quizContent") {
        const parentPath = path.split('.').slice(0, -1).join('.');
        const typePath = `${parentPath}.type`;
        const typeValue = watch(typePath);
        if (typeValue !== "quiz") return null;
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
            const def = (schema as any)._def;
            if (value === undefined && def && def.defaultValue !== undefined) {
                const defaultVal = typeof def.defaultValue === "function"
                    ? def.defaultValue()
                    : def.defaultValue;
                setValue(path, defaultVal);
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
                        checked={value === true}
                        onCheckedChange={(checked) => setValue(path, checked, { shouldValidate: true, shouldDirty: true })}
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
                    checked={value === true}
                    onCheckedChange={(checked) => setValue(path, checked, { shouldValidate: true, shouldDirty: true })}
                />
            </div>
        );
    }

    // Handle ZodArray
    if (underlyingSchema instanceof z.ZodArray) {
        return <ArrayField name={name} path={path} schema={underlyingSchema} />;
    }

    // Handle ZodEnum
    if (underlyingSchema instanceof z.ZodEnum) {
        const value = watch(path);
        return (
            <div className="space-y-2 w-full">
                <Label htmlFor={path} className="capitalize">
                    {name}
                </Label>
                {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                )}
                <Select
                    onValueChange={(val) => setValue(path, val)}
                    value={value}
                >
                    <SelectTrigger id={path}>
                        <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                        {underlyingSchema.options.map((option: any) => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        );
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
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: path,
    });
    const { formState: { errors } } = useFormContext();

    // Helper to get nested error
    const getError = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const error = getError(errors, path);
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

            <div className={isAnswers ? "space-y-4" : "space-y-3"}>
                {fields.map((field, index) => {
                    if (isAnswers && itemSchema instanceof z.ZodObject) {
                        return (
                            <div key={field.id} className="space-y-2 border p-4 rounded-lg bg-card/50">
                                <div className="flex items-center justify-between">
                                    <Label className="font-medium">Text</Label>
                                    <div className="flex items-center gap-4">
                                        <FieldRenderer
                                            name="correct"
                                            path={`${path}.${index}.correct`}
                                            schema={(itemSchema as z.ZodObject<any>).shape.correct}
                                        />
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
                                </div>
                                <Input
                                    {...register(`${path}.${index}.text`)}
                                    placeholder="Answer text"
                                />
                                {getError(errors, `${path}.${index}.text`)?.message && (
                                    <p className="text-sm text-destructive">{getError(errors, `${path}.${index}.text`)?.message}</p>
                                )}
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

            {error && error.message && (
                <p className="text-sm font-medium text-destructive">{error.message}</p>
            )}
        </div>
    );
}
