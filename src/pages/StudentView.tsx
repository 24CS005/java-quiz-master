import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionLeaderboard } from "@/components/SessionLeaderboard";
import { QuestionTimer } from "@/components/QuestionTimer";
import { socketService } from "@/services/socket";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Timer, Award } from "lucide-react";

interface QuestionData {
    questionId: string;
    text: string;
    options: string[];
    order: number;
}

const StudentView = () => {
    const { sessionId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const username = state?.username || "Anonymous";

    const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: number } | null>(null);
    const [score, setScore] = useState(0);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [timerDuration, setTimerDuration] = useState(35);
    const [gameFinished, setGameFinished] = useState(false);

    useEffect(() => {
        if (!sessionId) {
            navigate("/");
            return;
        }

        socketService.connect();
        socketService.joinSession(sessionId, username);

        socketService.onError((err) => {
            const message = typeof err === "string" ? err : err?.message;
            toast.error(message || "Unable to join session");
            navigate("/");
        });

        socketService.onQuestionReceived((question) => {
            setCurrentQuestion(question);
            setSelectedOption(null);
            setIsAnswered(false);
            setFeedback(null);
            setTimerStart(Date.now());
            setTimerDuration(35);
        });

        socketService.onAnswerResult((result) => {
            setFeedback(result);
            if (result.correct) {
                setScore((prev) => prev + 10);
                toast.success("Correct! +10 points");
            } else {
                toast.error("Oops! Incorrect.");
            }
        });

        socketService.onTimerStart((data) => {
            console.log('Timer started:', data);
            setTimerStart(data.startTime);
            setTimerDuration(data.duration || 35);
        });

        socketService.onGameFinished(() => {
            setGameFinished(true);
        });

        return () => {
            socketService.disconnect();
        };
    }, [sessionId, username, navigate]);

    const handleSubmit = (index: number) => {
        if (!sessionId || !currentQuestion || isAnswered) return;

        setSelectedOption(index);
        setIsAnswered(true);
        socketService.submitAnswer(sessionId, currentQuestion.questionId, index);
    };

    if (gameFinished && sessionId) {
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="text-2xl font-bold text-center">Quiz Finished!</h2>
                    <SessionLeaderboard sessionId={sessionId} currentUsername={username} isLoading={false} />
                    <div className="flex justify-center">
                        <Button onClick={() => navigate("/")}>Back to Home</Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-indigo-600 flex flex-col items-center justify-center p-4 text-white">
                <Timer className="h-16 w-16 mb-6 animate-pulse" />
                <h2 className="text-3xl font-bold mb-2">Wait for the host...</h2>
                <p className="opacity-80">The quiz will start soon. Get ready!</p>
                <div className="mt-12 bg-indigo-500/50 p-4 rounded-lg border border-indigo-400">
                    <p className="font-mono text-sm">Playing as: <span className="font-bold">{username}</span></p>
                    <p className="font-mono text-sm">Session: <span className="font-bold">{sessionId}</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-4 flex flex-col">
            <header className="flex justify-between items-center mb-8 px-4 py-3 bg-white rounded-xl shadow-sm border border-slate-100">
                <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Award className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-700">{score} pts</span>
                </div>
                <QuestionTimer startTime={timerStart ?? undefined} duration={timerDuration} />
                <div className="text-sm font-medium text-slate-500">
                    Q{currentQuestion.order + 1}
                </div>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
                <Card className="w-full border-none shadow-xl bg-white overflow-hidden">
                    <div className="h-2 bg-indigo-500 w-full" />
                    <CardHeader className="pt-8 text-left">
                        <CardTitle className="text-2xl font-bold text-slate-800 leading-tight">
                            {currentQuestion.text}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-8 space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {currentQuestion.options.map((option, index) => {
                                let variant: "outline" | "default" | "secondary" = "outline";
                                let className = "py-6 text-lg justify-start h-auto px-6 transition-all duration-200";

                                if (selectedOption === index) {
                                    variant = "default";
                                    className += " border-indigo-600 ring-2 ring-indigo-200";
                                }

                                if (feedback) {
                                    if (index === feedback.correctAnswer) {
                                        className += " bg-green-100 border-green-500 text-green-700 hover:bg-green-100";
                                    } else if (selectedOption === index && !feedback.correct) {
                                        className += " bg-red-100 border-red-500 text-red-700 hover:bg-red-100";
                                    } else {
                                        className += " opacity-50";
                                    }
                                }

                                return (
                                    <Button
                                        key={index}
                                        variant={variant}
                                        className={className}
                                        onClick={() => handleSubmit(index)}
                                        disabled={isAnswered}
                                    >
                                        <span className="mr-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-sm font-bold group-hover:bg-white">
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span className="text-left">{option}</span>
                                        {feedback && index === feedback.correctAnswer && (
                                            <CheckCircle2 className="ml-auto h-6 w-6 text-green-600" />
                                        )}
                                        {feedback && selectedOption === index && !feedback.correct && (
                                            <XCircle className="ml-auto h-6 w-6 text-red-600" />
                                        )}
                                    </Button>
                                );
                            })}
                        </div>

                        {feedback && (
                            <div className={`mt-8 p-4 rounded-xl text-center font-bold text-lg animate-in fade-in slide-in-from-bottom-4 duration-500 ${feedback.correct ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {feedback.correct ? "Great Job! Correct Answer" : "Not quite! See the correct one above"}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {isAnswered && !feedback && (
                    <p className="mt-8 text-slate-500 font-medium animate-pulse flex items-center">
                        Waiting for results...
                    </p>
                )}

                {feedback && (
                    <p className="mt-8 text-indigo-600 font-bold animate-pulse">
                        Wait for the next question...
                    </p>
                )}
            </div>
        </div>
    );
};

export default StudentView;
