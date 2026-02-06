import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PdfUpload } from "@/components/PdfUpload";
import { quizService } from "@/services/quizService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Question, javaQuestions } from "@/data/javaQuestions";

const CreateQuiz = () => {
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handlePdfProcessed = async (extractedQuestions: any[]) => {
        // Direct mapping from the extracted questions
        if (extractedQuestions && extractedQuestions.length > 0) {
            const formatted: Question[] = extractedQuestions.map((q, i) => ({
                id: Date.now() + i, // Generate unique temp IDs
                question: q.question,
                options: q.options as string[],
                correctAnswer: q.correct_answer,
                explanation: q.explanation || ""
            }));
            setQuestions(prev => [...prev, ...formatted]);
        }
    };

    const handleUseSample = () => {
        // Add 5 random sample questions
        const samples = javaQuestions.slice(0, 5);
        setQuestions(prev => [...prev, ...samples]);
        toast.success("Added 5 sample questions");
    };

    const handleStartQuiz = () => {
        if (questions.length === 0) {
            toast.error("Please add at least one question");
            return;
        }

        // Navigate to quiz session with questions in state (No DB saving)
        navigate("/quiz/session", {
            state: {
                questions: questions,
                title: title || "Generated Quiz"
            }
        });
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => navigate("/")}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/vectra-logo.png" alt="Vectra Logo" className="w-16 h-16 object-contain" />
                        <h1 className="text-3xl font-bold">Vectra Quizzes</h1>
                    </div>
                    <Button onClick={handleStartQuiz} size="lg">
                        <Play className="w-4 h-4 mr-2" /> Start Quiz
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quiz Title</label>
                            <Input
                                placeholder="e.g. Java Basics Midterm"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Add Questions</h2>
                        <PdfUpload onQuestionsExtracted={handlePdfProcessed} />

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleUseSample}>
                            Add Sample Questions
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">Questions ({questions.length})</h2>
                            {questions.length > 0 && (
                                <Button variant="destructive" size="sm" onClick={() => setQuestions([])}>Clear All</Button>
                            )}
                        </div>

                        <div className="h-[500px] overflow-y-auto space-y-3 pr-2">
                            {questions.map((q, i) => (
                                <Card key={i} className="p-4 text-sm">
                                    <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {q.options.map((opt, idx) => (
                                            <div key={idx} className={`p-2 rounded border ${opt === q.correctAnswer ? 'bg-green-50 border-green-200' : 'bg-muted/50'}`}>
                                                {opt}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            ))}
                            {questions.length === 0 && (
                                <div className="text-center text-muted-foreground py-10 border-2 border-dashed rounded-lg">
                                    No questions added yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuiz;
