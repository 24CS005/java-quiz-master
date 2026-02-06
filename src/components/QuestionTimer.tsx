import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionTimerProps {
  startTime?: number;
  duration?: number;
  onTimeUp?: () => void;
}

export function QuestionTimer({ startTime, duration = 35, onTimeUp }: QuestionTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!startTime) {
      setTimeLeft(duration);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onTimeUp?.();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, onTimeUp]);

  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-2 rounded-lg font-bold text-lg transition-all",
      isCritical && "bg-red-500/20 text-red-600 animate-pulse",
      isWarning && !isCritical && "bg-yellow-500/20 text-yellow-600",
      !isWarning && !isCritical && "bg-green-500/20 text-green-600"
    )}>
      <Timer className="w-5 h-5" />
      <span className="w-12 text-right">{timeLeft}s</span>
    </div>
  );
}
