import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Gamepad2 } from "lucide-react";

interface UsernameFormProps {
  onSubmit: (username: string) => void;
  isLoading?: boolean;
}

export function UsernameForm({ onSubmit, isLoading }: UsernameFormProps) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    
    if (trimmedUsername.length < 3) {
      setError("Username must be at least 3 characters");
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError("Username must be less than 20 characters");
      return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Username can only contain letters, numbers, and underscores");
      return;
    }
    
    setError("");
    onSubmit(trimmedUsername);
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Java Quiz Challenge
        </CardTitle>
        <CardDescription className="text-base">
          Test your Java programming knowledge with 30 timed questions!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12 text-lg"
                disabled={isLoading}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 text-lg font-semibold"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Start Quiz"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
