import { useState, useCallback } from "react";
import { UsernameForm } from "@/components/UsernameForm";
import { QuizGame } from "@/components/QuizGame";
import { QuizResult } from "@/components/QuizResult";
import { Leaderboard } from "@/components/Leaderboard";
import { FeedbackForm } from "@/components/FeedbackForm";
import { FeedbackList } from "@/components/FeedbackList";
import { PdfUpload } from "@/components/PdfUpload";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { javaQuestions, getRandomQuestions, Question } from "@/data/javaQuestions";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, MessageSquare, Upload, Gamepad2 } from "lucide-react";
import { toast } from "sonner";

type GameState = "start" | "playing" | "result" | "leaderboard";

const Index = () => {
  const [gameState, setGameState] = useState<GameState>("start");
  const [username, setUsername] = useState("");
  const [playerId, setPlayerId] = useState<string | undefined>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [customQuestionsCount, setCustomQuestionsCount] = useState(0);
  const [quizSessionId, setQuizSessionId] = useState<string>("");
  const [quizDetails, setQuizDetails] = useState<any>(null);

  const handleStartGame = async (enteredUsername: string) => {
    setIsLoading(true);
    setUsername(enteredUsername);

    try {
      // Check if player exists or create new one
      let { data: existingPlayer } = await supabase
        .from('players')
        .select('id')
        .eq('username', enteredUsername)
        .single();

      let playerIdValue: string;

      if (existingPlayer) {
        playerIdValue = existingPlayer.id;
      } else {
        const { data: newPlayer, error } = await supabase
          .from('players')
          .insert({ username: enteredUsername })
          .select('id')
          .single();

        if (error) {
          if (error.code === '23505') {
            // Username already exists, fetch it
            const { data: existingPlayer2 } = await supabase
              .from('players')
              .select('id')
              .eq('username', enteredUsername)
              .single();
            playerIdValue = existingPlayer2?.id || '';
          } else {
            throw error;
          }
        } else {
          playerIdValue = newPlayer.id;
        }
      }

      setPlayerId(playerIdValue);

      // Fetch custom questions from database
      const { data: customQuestions } = await supabase
        .from('custom_questions')
        .select('*')
        .limit(10);

      // Combine built-in and custom questions
      let allQuestions = [...javaQuestions];
      
      if (customQuestions && customQuestions.length > 0) {
        const formattedCustom = customQuestions.map((q, index) => ({
          id: 100 + index,
          question: q.question,
          options: q.options as string[],
          correctAnswer: q.correct_answer,
          explanation: q.explanation || "This question was added from a PDF upload.",
        }));
        allQuestions = [...allQuestions, ...formattedCustom];
      }

      // Get 30 random questions
      const selectedQuestions = getRandomQuestions(allQuestions, 30);
      setQuestions(selectedQuestions);
      setQuizSessionId(crypto.randomUUID()); // Create new session ID for this quiz
      setGameState("playing");
    } catch (error) {
      console.error('Error starting game:', error);
      toast.error("Failed to start game. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizComplete = useCallback(async (finalScore: number, totalTimeSeconds: number, details?: any) => {
    setScore(finalScore);
    setTotalTime(totalTimeSeconds);
    setQuizDetails(details);

    // Save score to database with quiz session ID
    if (playerId) {
      const { error } = await supabase.from('quiz_scores').insert({
        player_id: playerId,
        score: finalScore,
        total_questions: questions.length,
        time_taken_seconds: totalTimeSeconds,
        quiz_session_id: quizSessionId, // Save the session ID
      });

      if (error) {
        console.error('Error saving score:', error);
      }
    }

    setGameState("result");
  }, [playerId, questions.length, quizSessionId]);

  const handlePlayAgain = () => {
    const selectedQuestions = getRandomQuestions(javaQuestions, 30);
    setQuestions(selectedQuestions);
    setQuizSessionId(crypto.randomUUID()); // Create new session ID for the new quiz
    setGameState("playing");
  };

  const handleViewLeaderboard = () => {
    setGameState("leaderboard");
  };

  const handleBackToStart = () => {
    setGameState("start");
    setUsername("");
    setPlayerId(undefined);
    setScore(0);
    setTotalTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Java Quiz</h1>
          </div>
          {gameState !== "start" && (
            <Button variant="ghost" onClick={handleBackToStart}>
              Home
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {gameState === "start" && (
          <div className="max-w-4xl mx-auto space-y-8">
            <UsernameForm onSubmit={handleStartGame} isLoading={isLoading} />
            
            <Tabs defaultValue="leaderboard" className="w-full max-w-2xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="leaderboard" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Leaderboard
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload PDF
                </TabsTrigger>
              </TabsList>
              <TabsContent value="leaderboard" className="mt-6">
                <Leaderboard onBack={() => {}} currentUsername={username} quizSessionId={quizSessionId} />
              </TabsContent>
              <TabsContent value="feedback" className="mt-6 space-y-6">
                <FeedbackForm playerId={playerId} />
                <FeedbackList />
              </TabsContent>
              <TabsContent value="upload" className="mt-6">
                <PdfUpload onQuestionsExtracted={setCustomQuestionsCount} />
                {customQuestionsCount > 0 && (
                  <p className="text-center text-sm text-muted-foreground mt-4">
                    {customQuestionsCount} custom questions will be included in your next quiz!
                  </p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {gameState === "playing" && (
          <QuizGame
            questions={questions}
            username={username}
            onComplete={handleQuizComplete}
          />
        )}

        {gameState === "result" && (
          <div className="space-y-8">
            <QuizResult
              username={username}
              score={score}
              totalQuestions={questions.length}
              totalTime={totalTime}
              onPlayAgain={handlePlayAgain}
              onViewLeaderboard={handleViewLeaderboard}
              details={quizDetails}
            />
            <FeedbackForm playerId={playerId} />
          </div>
        )}

        {gameState === "leaderboard" && (
          <Leaderboard onBack={handleBackToStart} currentUsername={username} quizSessionId={quizSessionId} />
        )}
      </main>
    </div>
  );
};

export default Index;
