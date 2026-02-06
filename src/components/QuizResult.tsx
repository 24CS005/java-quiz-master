import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SessionLeaderboard } from "./SessionLeaderboard";
import { Trophy, Clock, Target, RotateCcw, Medal, Zap } from "lucide-react";

interface QuizResultProps {
  sessionId?: string;
  username: string;
  score: number;
  totalQuestions: number;
  totalTime: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  details?: {
    responseTimes?: number[];
    correctAnswers?: number;
    totalQuestions?: number;
  };
}

export function QuizResult({
  sessionId,
  username,
  score,
  totalQuestions,
  totalTime,
  onPlayAgain,
  onViewLeaderboard,
  details,
}: QuizResultProps) {
  const maxScore = totalQuestions;
  const timeBasedScore = score;
  const percentage = Math.round((timeBasedScore / maxScore) * 100);
  const correctAnswers = details?.correctAnswers || 0;
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
  const minutes = Math.floor(totalTime / 60);
  const seconds = totalTime % 60;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-500", message: "Outstanding!" };
    if (percentage >= 80) return { grade: "A", color: "text-green-500", message: "Excellent!" };
    if (percentage >= 70) return { grade: "B", color: "text-blue-500", message: "Good Job!" };
    if (percentage >= 60) return { grade: "C", color: "text-yellow-500", message: "Not Bad!" };
    if (percentage >= 50) return { grade: "D", color: "text-orange-500", message: "Keep Trying!" };
    return { grade: "F", color: "text-red-500", message: "Need Practice!" };
  };

  const { grade, color, message } = getGrade();

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="shadow-2xl border-2 border-primary/20 overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-primary/5 pt-8 pb-4">
          <div className="text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-background flex items-center justify-center mb-4 shadow-lg">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Quiz Complete!</h2>
            <p className="text-muted-foreground">Well played, {username}!</p>
          </div>
        </div>
        
        <CardContent className="pt-6 space-y-6">
          {/* Grade */}
          <div className="text-center">
            <div className={`text-6xl font-black ${color}`}>{grade}</div>
            <p className="text-lg font-medium mt-1">{message}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/50">
              <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
              <div className="text-xs text-muted-foreground mt-1">{accuracy}% Accuracy</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-200">
              <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">{timeBasedScore.toFixed(1)}/{maxScore}</div>
              <div className="text-xs text-yellow-700 font-medium">Time-Based Score</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/50 col-span-2">
              <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              <div className="text-xs text-muted-foreground">Total Time</div>
            </div>
          </div>

          {/* Leaderboard */}
          {sessionId && (
            <div className="mt-8 pt-8 border-t">
              <SessionLeaderboard
                sessionId={sessionId}
                currentUsername={username}
                isLoading={false}
              />
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button onClick={onViewLeaderboard} className="w-full h-12" variant="default">
              <Trophy className="w-5 h-5 mr-2" />
              View Leaderboard
            </Button>
            <Button onClick={onPlayAgain} className="w-full h-12" variant="outline">
              <RotateCcw className="w-5 h-5 mr-2" />
              Play Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
