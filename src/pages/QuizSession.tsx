import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Question } from "@/data/javaQuestions";
import { QuizGame } from "@/components/QuizGame"; // Reuse existing UI
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const QuizSession = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get data directly from navigation state
    const quizTitle = location.state?.title;
    const questions = location.state?.questions as Question[];

    useEffect(() => {
        if (!questions || questions.length === 0) {
            toast.error("No questions found. Please generate a quiz first.");
            navigate("/");
            return;
        }
    }, [questions, navigate]);

    const handleComplete = (score: number, totalTime: number, details?: any) => {
        // Simple completion without DB
        toast.success(`Quiz Completed! Score: ${score.toFixed(1)}/${questions.length}`);
        // Could show a local result summary here or just navigate back
        navigate("/", { state: { lastScore: score, total: questions.length, details } });
    };

    if (!questions || questions.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-4 py-8">
            <div className="container mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold">{quizTitle}</h1>
                    <p className="text-muted-foreground">{questions.length} Questions</p>
                </div>

                <QuizGame
                    questions={questions}
                    username="Player"
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
};

export default QuizSession;

