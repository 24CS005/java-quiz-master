-- Create Quizzes Table (if not exists)
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    access_code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    teacher_id UUID DEFAULT auth.uid(), -- Optional, links to auth.users if logged in
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Results Table
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to ensure clean state
DROP POLICY IF EXISTS "Enable all access for now" ON public.quizzes;
DROP POLICY IF EXISTS "Enable all access for now" ON public.quiz_questions;
DROP POLICY IF EXISTS "Enable all access for now" ON public.results;

-- Create Permissive Policies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Enable all access for now" ON public.quizzes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.quiz_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for now" ON public.results FOR ALL USING (true) WITH CHECK (true);
