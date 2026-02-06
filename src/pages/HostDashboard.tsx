import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SessionLeaderboard } from "@/components/SessionLeaderboard";
import { toast } from "sonner";
import { uploadPdf, createSession, saveSessionQuestions } from "@/services/api";
import { socketService } from "@/services/socket";
import { QuestionTimer } from "@/components/QuestionTimer";
import { Upload, Play, Send, Trophy, Users as UsersIcon } from "lucide-react";

interface Question {
    _id?: string;
    question: string;
    options: string[];
    correctAnswer: number;
}

const HostDashboard = () => {
    const [sessionId, setSessionId] = useState<string>("");
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
    const [players, setPlayers] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [gameFinished, setGameFinished] = useState(false);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [timerDuration, setTimerDuration] = useState(35);

    useEffect(() => {
        socketService.connect();

        socketService.onPlayerJoined((player) => {
            setPlayers((prev) => [...prev, player]);
            toast.success(`${player.username} joined!`);
        });

        socketService.onLeaderboardUpdate((data) => {
            setLeaderboard(data);
        });

        socketService.onTimerStart((data) => {
            setTimerStart(data.startTime);
            setTimerDuration(data.duration || 35);
        });

        socketService.onGameFinished((data) => {
            setGameFinished(true);
            if (data?.leaderboard) {
                setLeaderboard(data.leaderboard);
            }
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    const handleCreateSession = async () => {
        try {
            const data = await createSession();
            setSessionId(data.sessionId);
            socketService.joinSession(data.sessionId, "Host");
            toast.success("Session created! Share the ID with your students.");
        } catch (error: any) {
            console.error("Session creation error:", error);
            const message = error.response?.data?.error || "Failed to create session. Is the server running?";
            toast.error(message);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !sessionId) {
            if (!sessionId) toast.error("Create a session first!");
            return;
        }

        setLoading(true);
        try {
            const file = e.target.files[0];
            console.log("Uploading file:", file.name);
            const data = await uploadPdf(file);
            console.log("AI Response:", data);

            if (!data.questions || data.questions.length === 0) {
                throw new Error("No questions returned from AI");
            }

            setQuestions(data.questions);

            // Save questions to the session in DB
            console.log("Saving questions to session:", sessionId);
            await saveSessionQuestions(sessionId, data.questions);

            toast.success("Questions generated successfully!");
        } catch (error: any) {
            console.error("Upload/Generation error:", error);
            const message = error.response?.data?.error || error.message || "Error generating questions";
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const pushNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            socketService.pushQuestion(sessionId, nextIndex);
            setTimerStart(Date.now());
            setTimerDuration(35);
            toast.info(`Question ${nextIndex + 1} pushed!`);
        } else {
            toast.warning("No more questions!");
        }
    };

    const handleEndSession = () => {
        if (!sessionId) return;
        socketService.endSession(sessionId);
        toast.success("Quiz ended! Showing final leaderboard.");
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 text-left">Host Dashboard</h1>
                        {sessionId && (
                            <p className="text-xl font-mono bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md mt-2 inline-block">
                                Session ID: {sessionId}
                            </p>
                        )}
                    </div>
                    {!sessionId && (
                        <Button onClick={handleCreateSession} size="lg" className="bg-indigo-600">
                            <Play className="mr-2 h-4 w-4" /> Start New Session
                        </Button>
                    )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Controls */}
                    <div className="md:col-span-2 space-y-6 text-left">
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Setup</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed rounded-lg p-8 text-center border-slate-200">
                                    <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <p className="text-sm text-slate-600 mb-4">Upload a PDF to generate questions</p>
                                    <Input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="max-w-xs mx-auto"
                                        disabled={loading || !sessionId}
                                    />
                                    {loading && <p className="mt-4 text-indigo-600 font-medium">AI is reading your content...</p>}
                                </div>
                            </CardContent>
                        </Card>

                        {questions.length > 0 && (
                            <Card className="border-indigo-200 shadow-md">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Quiz Control</CardTitle>
                                    <QuestionTimer
                                        startTime={timerStart ?? undefined}
                                        duration={timerDuration}
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button onClick={pushNextQuestion} variant="default" className="bg-green-600 hover:bg-green-700">
                                            <Send className="mr-2 h-4 w-4" />
                                            {currentQuestionIndex === -1 ? "Push First Question" : "Push Next Question"}
                                        </Button>
                                        {currentQuestionIndex >= questions.length - 1 && questions.length > 0 && (
                                            <Button onClick={handleEndSession} variant="outline" className="border-indigo-200 text-indigo-700">
                                                End Quiz
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {questions.map((q, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-lg border ${idx === currentQuestionIndex ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-100'}`}
                                            >
                                                <p className="font-semibold text-slate-800">Q{idx + 1}: {q.question}</p>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    {q.options.map((opt, oIdx) => (
                                                        <div key={oIdx} className={`text-xs p-1 rounded ${oIdx === q.correctAnswer ? 'bg-green-100 text-green-700 font-bold' : 'bg-slate-50 text-slate-500'}`}>
                                                            {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center space-x-2">
                                <UsersIcon className="h-5 w-5 text-indigo-500" />
                                <CardTitle>Players ({players.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {players.length === 0 && <p className="text-slate-400 text-sm">Waiting for players...</p>}
                                    {players.map((p, i) => (
                                        <div key={i} className="flex items-center space-x-2 p-2 bg-slate-50 rounded">
                                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            <span className="text-sm font-medium">{p.username}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-900 text-white">
                            <CardHeader className="flex flex-row items-center space-x-2 border-b border-slate-800">
                                <Trophy className="h-5 w-5 text-yellow-400" />
                                <CardTitle>Live Leaderboard</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4 text-left">
                                    {leaderboard.length === 0 && <p className="text-slate-500 text-sm">No scores yet</p>}
                                    {leaderboard.map((entry, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-slate-400 font-bold w-4">{i + 1}.</span>
                                                <span className="font-semibold">{entry.username}</span>
                                            </div>
                                            <span className="text-indigo-400 font-mono font-bold">{entry.score} pts</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {gameFinished && sessionId && (
                            <SessionLeaderboard
                                sessionId={sessionId}
                                currentUsername="Host"
                                isLoading={false}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HostDashboard;
