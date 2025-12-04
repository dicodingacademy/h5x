import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import type { TrueFalseContent } from "~/registry/true-false/schema";

export function TrueFalsePlayer({
    data,
}: {
    data: TrueFalseContent;
}) {
    const [selected, setSelected] = useState<boolean | null>(null);
    const [submitted, setSubmitted] = useState(false);

    if (!data) return <div>No content data</div>;

    const isCorrect = selected === data.correctResponse;

    const handleSelect = (value: boolean) => {
        if (submitted) return;
        setSelected(value);
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">{data.question || "Question Text"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex gap-4 justify-center">
                        <Button
                            variant={selected === true ? "default" : "outline"}
                            size="lg"
                            className={`w-32 h-32 text-2xl font-bold flex flex-col gap-2 ${submitted && data.correctResponse === true
                                    ? "bg-green-100 text-green-800 border-green-500 hover:bg-green-200"
                                    : ""
                                } ${submitted && selected === true && !isCorrect
                                    ? "bg-red-100 text-red-800 border-red-500 hover:bg-red-200"
                                    : ""
                                }`}
                            onClick={() => handleSelect(true)}
                            disabled={submitted}
                        >
                            True
                        </Button>
                        <Button
                            variant={selected === false ? "default" : "outline"}
                            size="lg"
                            className={`w-32 h-32 text-2xl font-bold flex flex-col gap-2 ${submitted && data.correctResponse === false
                                    ? "bg-green-100 text-green-800 border-green-500 hover:bg-green-200"
                                    : ""
                                } ${submitted && selected === false && !isCorrect
                                    ? "bg-red-100 text-red-800 border-red-500 hover:bg-red-200"
                                    : ""
                                }`}
                            onClick={() => handleSelect(false)}
                            disabled={submitted}
                        >
                            False
                        </Button>
                    </div>

                    {!submitted ? (
                        <Button
                            className="w-full mt-4"
                            disabled={selected === null}
                            onClick={() => setSubmitted(true)}
                        >
                            Check Answer
                        </Button>
                    ) : (
                        <div
                            className={`p-4 rounded-lg text-center font-medium space-y-2 ${isCorrect
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2 text-lg">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="h-6 w-6" />
                                        Correct!
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-6 w-6" />
                                        Incorrect
                                    </>
                                )}
                            </div>

                            {isCorrect && data.feedbackOnCorrect && (
                                <p className="text-sm opacity-90">{data.feedbackOnCorrect}</p>
                            )}
                            {!isCorrect && data.feedbackOnIncorrect && (
                                <p className="text-sm opacity-90">{data.feedbackOnIncorrect}</p>
                            )}

                            <Button
                                variant="link"
                                className="mt-2"
                                onClick={() => {
                                    setSubmitted(false);
                                    setSelected(null);
                                }}
                            >
                                Retry
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
