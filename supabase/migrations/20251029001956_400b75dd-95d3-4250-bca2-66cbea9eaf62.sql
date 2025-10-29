-- Create community_proposals table
CREATE TABLE IF NOT EXISTS public.community_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  votes INTEGER NOT NULL DEFAULT 0,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'voting',
  scheduled_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('voting', 'accepted', 'scheduled', 'rejected'))
);

-- Create proposal_votes table to track who voted
CREATE TABLE IF NOT EXISTS public.proposal_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES public.community_proposals(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, user_identifier)
);

-- Enable RLS
ALTER TABLE public.community_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_proposals
CREATE POLICY "Anyone can view proposals"
  ON public.community_proposals
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create proposals"
  ON public.community_proposals
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update proposals"
  ON public.community_proposals
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete proposals"
  ON public.community_proposals
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

-- RLS Policies for proposal_votes
CREATE POLICY "Anyone can view votes"
  ON public.proposal_votes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can vote"
  ON public.proposal_votes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own votes"
  ON public.proposal_votes
  FOR DELETE
  USING (user_identifier = ((current_setting('request.headers'::text, true))::json ->> 'x-user-id'::text));

-- Create updated_at trigger
CREATE TRIGGER update_community_proposals_updated_at
  BEFORE UPDATE ON public.community_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_community_proposals_status ON public.community_proposals(status);
CREATE INDEX IF NOT EXISTS idx_community_proposals_votes ON public.community_proposals(votes DESC);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_proposal_id ON public.proposal_votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_votes_user_identifier ON public.proposal_votes(user_identifier);