import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getSession } from "@/services/api";

const StudentJoin = () => {
    const [sessionId, setSessionId] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionId || !username) {
            toast.error("Please enter both Session ID and Name");
            return;
        }

        setLoading(true);
        try {
            const session = await getSession(sessionId.toUpperCase());
            if (session) {
                // Navigate to play page with state
                navigate(`/play/${sessionId.toUpperCase()}`, { state: { username } });
            }
        } catch (error) {
            toast.error("Session not found. Please check the ID.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-pink-500">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold text-slate-900">Join a Quiz</CardTitle>
                    <CardDescription>Enter the code shared by your teacher</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleJoin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Display Name</label>
                            <Input
                                placeholder="What should we call you?"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="text-center"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Session ID</label>
                            <Input
                                placeholder="ABCDEF"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value.toUpperCase())}
                                className="text-center font-mono text-xl uppercase tracking-widest"
                                maxLength={6}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-pink-600 hover:bg-pink-700 text-lg py-6"
                            disabled={loading}
                        >
                            {loading ? "Joining..." : "Join Game"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default StudentJoin;
