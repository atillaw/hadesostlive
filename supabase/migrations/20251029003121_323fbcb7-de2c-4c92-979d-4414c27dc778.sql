-- Create live polls table
CREATE TABLE public.live_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create poll votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.live_polls(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(poll_id, user_identifier)
);

-- Create daily trivia questions table
CREATE TABLE public.daily_trivia_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer INTEGER NOT NULL,
  active_date DATE NOT NULL,
  points INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(active_date)
);

-- Create trivia answers table
CREATE TABLE public.trivia_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.daily_trivia_questions(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  answer_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_polls
CREATE POLICY "Anyone can view active polls"
ON public.live_polls FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage polls"
ON public.live_polls FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for poll_votes
CREATE POLICY "Anyone can vote on polls"
ON public.poll_votes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view poll votes"
ON public.poll_votes FOR SELECT
USING (true);

CREATE POLICY "Admins can manage poll votes"
ON public.poll_votes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for daily_trivia_questions
CREATE POLICY "Anyone can view active trivia"
ON public.daily_trivia_questions FOR SELECT
USING (active_date = CURRENT_DATE);

CREATE POLICY "Admins can manage trivia questions"
ON public.daily_trivia_questions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for trivia_answers
CREATE POLICY "Anyone can submit trivia answers"
ON public.trivia_answers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own trivia answers"
ON public.trivia_answers FOR SELECT
USING (
  user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can view all trivia answers"
ON public.trivia_answers FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create indexes
CREATE INDEX idx_poll_votes_poll_id ON public.poll_votes(poll_id);
CREATE INDEX idx_poll_votes_user_identifier ON public.poll_votes(user_identifier);
CREATE INDEX idx_trivia_answers_question_id ON public.trivia_answers(question_id);
CREATE INDEX idx_trivia_answers_user_identifier ON public.trivia_answers(user_identifier);
CREATE INDEX idx_trivia_answers_answered_at ON public.trivia_answers(answered_at);
CREATE INDEX idx_daily_trivia_active_date ON public.daily_trivia_questions(active_date);

-- Update timestamps trigger for live_polls
CREATE TRIGGER update_live_polls_updated_at
BEFORE UPDATE ON public.live_polls
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();