import { supabase } from "@/integrations/supabase/client";
import { Question } from "@/data/javaQuestions";

export interface Quiz {
    id: string;
    access_code: string;
    title: string;
    created_at: string;
}

export const quizService = {
    // TEACHER: Create a new quiz
    async createQuiz(title: string, questions: Question[]) {
        // 1. Generate a unique 6-digit code
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString();

        // 2. Insert into 'quizzes'
        const { data: quizData, error: quizError } = await supabase
            .from("quizzes")
            .insert({
                title,
                access_code: accessCode,
            })
            .select()
            .single();

        if (quizError) throw quizError;
        if (!quizData) throw new Error("Failed to create quiz");

        // 3. Insert into 'quiz_questions'
        const { error: questionsError } = await supabase.from("quiz_questions").insert({
            quiz_id: quizData.id,
            question_data: questions as any, // Cast to any to bypass Json strict typing issues if simpler
        });

        if (questionsError) throw questionsError;

        return { quizId: quizData.id, accessCode };
    },

    // TEACHER: Get all quizzes created (for now getting all, later filter by user)
    async getTeacherQuizzes() {
        const { data, error } = await supabase
            .from("quizzes")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data;
    },

    // STUDENT: Join a quiz by code
    async getQuizByCode(code: string) {
        // 1. Find the quiz
        const { data: quiz, error: quizError } = await supabase
            .from("quizzes")
            .select("*")
            .eq("access_code", code)
            .single();

        if (quizError) throw quizError;
        if (!quiz) throw new Error("Quiz not found");

        // 2. Get the questions
        const { data: questionEntry, error: qError } = await supabase
            .from("quiz_questions")
            .select("question_data")
            .eq("quiz_id", quiz.id)
            .single();

        if (qError) throw qError;

        // 3. Parse/Return questions
        // question_data is stored as Json, we expect it to be Question[]
        return {
            quiz,
            questions: questionEntry.question_data as unknown as Question[],
        };
    },

    // STUDENT: Submit results
    async submitScore(quizId: string, studentName: string, score: number, totalQuestions: number) {
        const { error } = await supabase.from("results").insert({
            quiz_id: quizId,
            student_name: studentName,
            score,
            total_questions: totalQuestions,
        });

        if (error) throw error;
    },

    // COMMON: Get leaderboard for a quiz
    async getQuizResults(quizId: string) {
        const { data, error } = await supabase
            .from("results")
            .select("*")
            .eq("quiz_id", quizId)
            .order("score", { ascending: false })
            .order("created_at", { ascending: true }); // Tie-breaker: earlier submission wins

        if (error) throw error;
        return data;
    }
};
