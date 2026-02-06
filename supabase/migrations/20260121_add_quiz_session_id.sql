-- Add quiz_session_id column to quiz_scores table
ALTER TABLE public.quiz_scores ADD COLUMN quiz_session_id UUID NOT NULL DEFAULT gen_random_uuid();

-- Create an index on quiz_session_id for faster filtering
CREATE INDEX idx_quiz_scores_session_id ON public.quiz_scores(quiz_session_id);
