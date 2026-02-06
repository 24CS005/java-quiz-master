import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Users, Copy } from "lucide-react";
import { quizService } from "@/services/quizService";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { QuizLeaderboard } from "@/components/QuizLeaderboard";

const TeacherDashboard = () => {
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuizzes();
    }, []);

    const loadQuizzes = async () => {
        try {
            const data = await quizService.getTeacherQuizzes();
            setQuizzes(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load quizzes");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Access code copied!");
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                    <Link to="/teacher/create">
                        <Button className="gap-2">
                            <Plus className="w-4 h-4" /> Create New Quiz
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {quizzes.map((quiz) => (
                            <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <CardTitle>{quiz.title}</CardTitle>
                                    <CardDescription>Created on {new Date(quiz.created_at).toLocaleDateString()}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg border">
                                        <span className="font-mono text-lg font-bold tracking-wider">{quiz.access_code}</span>
                                        <Button variant="ghost" size="icon" onClick={() => copyCode(quiz.access_code)}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full gap-2">
                                                    <Users className="w-4 h-4" /> View Results
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                                <QuizLeaderboard quizId={quiz.id} title={`${quiz.title} - Results`} />
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {quizzes.length === 0 && (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                No quizzes created yet. Click "Create New Quiz" to get started.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherDashboard;
