import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface FeedbackEntry {
  id: string;
  comment: string;
  rating: number;
  created_at: string;
  username?: string;
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    const { data, error } = await supabase
      .from('feedback')
      .select(`
        id,
        comment,
        rating,
        created_at,
        players (username)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      const formattedData = data.map((entry: any) => ({
        id: entry.id,
        comment: entry.comment,
        rating: entry.rating,
        created_at: entry.created_at,
        username: entry.players?.username || 'Anonymous',
      }));
      setFeedback(formattedData);
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center border-b">
        <div className="flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <CardTitle>Recent Feedback</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No feedback yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedback.map((entry) => (
              <div
                key={entry.id}
                className="p-4 rounded-lg bg-muted/30 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{entry.username}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          entry.rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{entry.comment}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(entry.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
