import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import type { MultipleChoiceContent } from "~/registry/multiple-choice/schema";
import { Progress } from "~/components/ui/progress";

export function MultipleChoicePlayer({
    data,
}: {
    data: MultipleChoiceContent;
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // questionIndex -> answerIndex
    const [isFinished, setIsFinished] = useState(false);
    const [showResults, setShowResults] = useState(false);

    if (!data || !data.questions || data.questions.length === 0) {
        return <div>No questions available.</div>;
    }

    const currentQuestion = data.questions[currentQuestionIndex];
    const totalQuestions = data.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    const handleSelectAnswer = (answerIndex: number) => {
        if (showResults) return;
        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestionIndex]: answerIndex,
        }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        setIsFinished(true);
        setShowResults(true);
    };

    const calculateScore = () => {
        let correctCount = 0;
        data.questions.forEach((q, idx) => {
            const userAnswerIdx = userAnswers[idx];
            if (userAnswerIdx !== undefined && q.answers[userAnswerIdx]?.correct) {
                correctCount++;
            }
        });
        return Math.round((correctCount / totalQuestions) * 100);
    };

    const resetQuiz = () => {
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setIsFinished(false);
        setShowResults(false);
    };

    if (isFinished) {
        const score = calculateScore();
        const passed = score >= (data.settings?.passingScore ?? 80);

        return (
            <div className="max-w-2xl mx-auto p-4 space-y-6">
                <Card className="text-center p-8">
                    <CardHeader>
                        <CardTitle className="text-3xl mb-2">Quiz Completed</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                            <div className={`text-6xl font-bold ${passed ? "text-green-600" : "text-red-600"}`}>
                                {score}%
                            </div>
                            <p className="text-muted-foreground">
                                {passed ? "Congratulations! You passed." : "Keep practicing. You didn't pass this time."}
                            </p>
                        </div>

                        <div className="flex justify-center gap-4">
                            <Button onClick={resetQuiz} variant="outline">
                                <RotateCcw className="mr-2 h-4 w-4" />
                                Retry Quiz
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {data.settings?.showIncorrectAnswers && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Review Answers</h3>
                        {data.questions.map((q, qIdx) => {
                            const userAnswerIdx = userAnswers[qIdx];
                            const isCorrect = userAnswerIdx !== undefined && q.answers[userAnswerIdx]?.correct;

                            return (
                                <Card key={qIdx} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                                    <CardHeader className="pb-2">
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="text-base">{qIdx + 1}. {q.text}</CardTitle>
                                            {isCorrect ? (
                                                <CheckCircle2 className="text-green-500 h-5 w-5 shrink-0" />
                                            ) : (
                                                <XCircle className="text-red-500 h-5 w-5 shrink-0" />
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-sm space-y-1">
                                            {q.answers.map((ans, aIdx) => {
                                                const isSelected = userAnswerIdx === aIdx;
                                                const isAnswerCorrect = ans.correct;

                                                let style = "text-muted-foreground";
                                                if (isSelected && isAnswerCorrect) style = "text-green-600 font-medium";
                                                else if (isSelected && !isAnswerCorrect) style = "text-red-600 font-medium";
                                                else if (isAnswerCorrect) style = "text-green-600 font-medium";

                                                return (
                                                    <div key={aIdx} className={`flex items-center gap-2 ${style}`}>
                                                        {isSelected && (isAnswerCorrect ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />)}
                                                        {!isSelected && isAnswerCorrect && <CheckCircle2 className="h-3 w-3 opacity-50" />}
                                                        <span>{ans.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-4 w-full">
            <div className="mb-4 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Question {currentQuestionIndex + 1} of {totalQuestions}</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            <Card className="min-h-[400px] flex flex-col">
                <CardHeader>
                    <CardTitle className="text-xl">{currentQuestion.text || "Question Text"}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                    <div className="grid gap-3">
                        {currentQuestion.answers?.map((answer, index) => (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                className={`
                                    w-full text-left p-4 rounded-lg border-2 transition-all
                                    ${userAnswers[currentQuestionIndex] === index
                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                        : "border-muted hover:border-primary/50"
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{answer.text || "Answer Option"}</span>
                                    {userAnswers[currentQuestionIndex] === index && (
                                        <div className="h-4 w-4 rounded-full bg-primary" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="border-t p-6 bg-gray-50/50 dark:bg-gray-900/50">
                    <Button
                        className="w-full ml-auto md:w-auto"
                        onClick={handleNext}
                        disabled={userAnswers[currentQuestionIndex] === undefined}
                    >
                        {currentQuestionIndex === totalQuestions - 1 ? "Finish Quiz" : "Next Question"}
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
