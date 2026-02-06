import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, Presentation } from "lucide-react";

const Landing = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">QuizMaster AI</h1>
                <p className="text-xl text-white/90">Real-time interactive quizzes powered by AI</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
                <Card className="hover:shadow-2xl transition-all cursor-pointer group">
                    <CardHeader>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Presentation className="text-indigo-600 w-6 h-6" />
                        </div>
                        <CardTitle>Host a Quiz</CardTitle>
                        <CardDescription>Upload notes or a PDF and host a live session for your students.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/host">
                            <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Get Started</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-2xl transition-all cursor-pointer group">
                    <CardHeader>
                        <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="text-pink-600 w-6 h-6" />
                        </div>
                        <CardTitle>Join a Quiz</CardTitle>
                        <CardDescription>Enter a session ID to participate in a live quiz and compete on the leaderboard.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link to="/join">
                            <Button variant="outline" className="w-full border-pink-600 text-pink-600 hover:bg-pink-50">Join Now</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Landing;
