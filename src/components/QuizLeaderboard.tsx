import { useEffect, useState } from "react";
import { quizService } from "@/services/quizService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Medal, Loader2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface QuizLeaderboardProps {
    quizId: string;
    title?: string;
}

export function QuizLeaderboard({ quizId, title }: QuizLeaderboardProps) {
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadResults();
    }, [quizId]);

    const loadResults = async () => {
        try {
            const data = await quizService.getQuizResults(quizId);
            setResults(data || []);
        } catch (error) {
            console.error("Failed to load results", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
                <h3 className="font-semibold text-lg">No Results Yet</h3>
                <p className="text-muted-foreground">Be the first to complete this quiz!</p>
            </div>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    <CardTitle>{title || "Leaderboard"}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">Rank</TableHead>
                                <TableHead>Student</TableHead>
                                <TableHead className="text-right">Score</TableHead>
                                <TableHead className="text-right hidden md:table-cell">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {results.map((result, index) => (
                                <TableRow key={result.id} className={index < 3 ? "bg-primary/5" : ""}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {index === 0 && <Medal className="w-5 h-5 text-yellow-500" />}
                                            {index === 1 && <Medal className="w-5 h-5 text-gray-400" />}
                                            {index === 2 && <Medal className="w-5 h-5 text-amber-600" />}
                                            <span className="w-6 text-center">{index + 1}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">{result.student_name}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="font-bold text-primary">{result.score}/{result.total_questions}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {Math.round((result.score / result.total_questions) * 100)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right hidden md:table-cell text-muted-foreground text-sm">
                                        {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
