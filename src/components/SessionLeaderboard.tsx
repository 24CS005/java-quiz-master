import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { socketService } from "@/services/socket";

interface LeaderboardEntry {
  userId?: string;
  username: string;
  score?: number;
  finalScore?: number;
  totalQuestions?: number;
  timeTaken?: number;
  completed?: boolean;
}

interface SessionLeaderboardProps {
  sessionId?: string;
  currentUsername?: string;
  isLoading?: boolean;
}

export function SessionLeaderboard({ sessionId, currentUsername, isLoading }: SessionLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [gameEnded, setGameEnded] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    const handleGameFinished = (data: any) => {
      console.log('Game finished event received:', data);
      setEntries(data.leaderboard || []);
      setGameEnded(true);
    };

    socketService.onGameFinished(handleGameFinished);
    socketService.onLeaderboardUpdate((data: any) => {
      console.log('Leaderboard update:', data);
      setEntries(data);
    });

    return () => {
      // Cleanup
    };
  }, [sessionId]);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-muted-foreground">{index + 1}</span>;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScore = (entry: LeaderboardEntry) => {
    return entry.finalScore !== undefined ? entry.finalScore : entry.score || 0;
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl border-2 border-primary/20">
      <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          <CardTitle>Live Leaderboard</CardTitle>
        </div>
        {gameEnded && (
          <p className="text-sm text-muted-foreground mt-2">Quiz Completed!</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Waiting for players to join...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={entry.userId || index}
                className={`flex items-center gap-4 p-4 rounded-lg transition-all border ${
                  entry.username === currentUsername
                    ? 'bg-primary/10 border-primary/30 shadow-md'
                    : 'bg-muted/30 hover:bg-muted/50 border-transparent'
                }`}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold truncate">
                      {entry.username}
                    </p>
                    {entry.username === currentUsername && (
                      <Badge variant="secondary" className="text-xs">You</Badge>
                    )}
                    {entry.completed && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        Completed
                      </Badge>
                    )}
                  </div>
                  {entry.timeTaken !== undefined && (
                    <p className="text-xs text-muted-foreground">
                      Time: {formatTime(entry.timeTaken)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {entry.totalQuestions ? (
                    <>
                      <p className="font-bold text-lg text-primary">
                        {getScore(entry).toFixed(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        out of {entry.totalQuestions}
                      </p>
                    </>
                  ) : (
                    <p className="font-bold text-lg text-primary">
                      {getScore(entry).toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
