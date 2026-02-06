import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Timer, CheckCircle2, XCircle, HelpCircle, Zap } from "lucide-react";
import { Question } from "@/data/javaQuestions";
import { socketService } from "@/services/socket";
import { cn } from "@/lib/utils";

interface QuizGameProps {
  questions: Question[];
  username: string;
  sessionId?: string;
  onComplete: (score: number, totalTime: number, details?: any) => void;
}

const QUESTION_TIME = 35; // seconds per question
const BONUS_TIME_THRESHOLD = 10; // seconds for full marks

export function QuizGame({ questions, username, sessionId, onComplete }: QuizGameProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeBasedScore, setTimeBasedScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [totalTime, setTotalTime] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const [responseTimes, setResponseTimes] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  // Calculate time-based marks: Full marks if answered within 10 secs, scales down to 0 at 35 secs
  const calculateTimeBasedMarks = (timeUsed: number, isCorrect: boolean): number => {
    if (!isCorrect) return 0;
    if (timeUsed <= BONUS_TIME_THRESHOLD) return 1.0;
    const remainingTime = QUESTION_TIME - BONUS_TIME_THRESHOLD;
    return Math.max(0, (remainingTime - (timeUsed - BONUS_TIME_THRESHOLD)) / remainingTime);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(QUESTION_TIME);
      setIsAnswered(false);
    } else {
      const finalScore = timeBasedScore;
      const quizDetails = {
        responseTimes,
        correctAnswers: score,
        totalQuestions: questions.length
      };

      // Emit final score via socket if sessionId exists
      if (sessionId) {
        socketService.submitFinalScore(
          sessionId,
          username,
          finalScore,
          questions.length,
          totalTime + (QUESTION_TIME - timeLeft),
          quizDetails
        );
      }

      onComplete(finalScore, totalTime + (QUESTION_TIME - timeLeft), quizDetails);
    }
  }, [currentIndex, questions.length, timeBasedScore, totalTime, timeLeft, onComplete, responseTimes, score, sessionId, username]);

  const handleTimeUp = useCallback(() => {
    if (!isAnswered) {
      setIsAnswered(true);
      setShowResult(true);
      setTotalTime(prev => prev + QUESTION_TIME);
      setResponseTimes(prev => [...prev, QUESTION_TIME]);
    }
  }, [isAnswered]);

  useEffect(() => {
    if (timeLeft > 0 && !isAnswered) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswered) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswered, handleTimeUp]);

  const handleAnswer = (answer: string) => {
    if (isAnswered) return;

    const timeUsed = QUESTION_TIME - timeLeft;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResult(true);
    setTotalTime(prev => prev + timeUsed);
    setResponseTimes(prev => [...prev, timeUsed]);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      const marks = calculateTimeBasedMarks(timeUsed, isCorrect);
      setTimeBasedScore(prev => prev + marks);
    }
  };

  const getButtonVariant = (option: string) => {
    if (!showResult) return "outline";
    if (option === currentQuestion.correctAnswer) return "default";
    if (option === selectedAnswer && option !== currentQuestion.correctAnswer) return "destructive";
    return "outline";
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Badge variant="secondary" className="text-sm px-3 py-1">
          Player: {username}
        </Badge>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm px-3 py-1">
            Score: {score}/{questions.length}
          </Badge>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Points: {timeBasedScore.toFixed(1)}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Question {currentIndex + 1} of {questions.length}</span>
          <div className={cn(
            "flex items-center gap-2 font-bold text-lg px-4 py-2 rounded-lg transition-all",
            timeLeft > 20 && "bg-green-500/20 text-green-600",
            timeLeft <= 20 && timeLeft > 10 && "bg-yellow-500/20 text-yellow-600",
            timeLeft <= 10 && "bg-red-500/20 text-red-600 animate-pulse"
          )}>
            <Timer className="w-5 h-5" />
            <span className="w-8 text-right">{timeLeft}s</span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300",
              timeLeft > 20 && "bg-green-500",
              timeLeft <= 20 && timeLeft > 10 && "bg-yellow-500",
              timeLeft <= 10 && "bg-red-500"
            )}
            style={{ width: `${(timeLeft / QUESTION_TIME) * 100}%` }}
          />
        </div>
        <Progress value={progress} className="h-1 mt-4" />
      </div>

      {/* Question Card */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <CardTitle className="text-lg leading-relaxed">
              {currentQuestion.question}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant={getButtonVariant(option)}
              className={cn(
                "w-full justify-start text-left h-auto py-4 px-4",
                showResult && option === currentQuestion.correctAnswer && "bg-green-500 hover:bg-green-600 text-white",
                showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && "bg-red-500 hover:bg-red-600 text-white"
              )}
              onClick={() => handleAnswer(option)}
              disabled={isAnswered}
            >
              <span className="font-medium mr-3 w-6 h-6 rounded-full bg-background/20 flex items-center justify-center text-sm">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
              {showResult && option === currentQuestion.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 ml-auto" />
              )}
              {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                <XCircle className="w-5 h-5 ml-auto" />
              )}
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Explanation & Next Button */}
      {showResult && (
        <div className="space-y-4">
          {selectedAnswer === currentQuestion.correctAnswer && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-green-900">Correct!</p>
                    <p className="text-sm text-green-700 mt-1">
                      Time taken: {QUESTION_TIME - timeLeft}s
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        Points earned: {calculateTimeBasedMarks(QUESTION_TIME - timeLeft, true).toFixed(2)}/1.00
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedAnswer === null && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Time's up!</p>
                    <p className="text-sm text-red-700 mt-1">
                      Correct answer was: <span className="font-medium">{currentQuestion.correctAnswer}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-900">Incorrect!</p>
                    <p className="text-sm text-red-700 mt-1">
                      Correct answer was: <span className="font-medium">{currentQuestion.correctAnswer}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Button onClick={handleNext} className="w-full h-12 text-lg">
            {currentIndex < questions.length - 1 ? "Next Question" : "View Results"}
          </Button>
        </div>
      )}
    </div>
  );
}
