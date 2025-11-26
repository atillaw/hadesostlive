-- Fix function search paths for security
ALTER FUNCTION update_post_vote_counts() SET search_path = public;
ALTER FUNCTION update_comment_vote_counts() SET search_path = public;
ALTER FUNCTION update_post_comment_count() SET search_path = public;

-- Add RLS policy for university_moderators
CREATE POLICY "Admins can manage moderators"
  ON university_moderators FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Moderators can view themselves"
  ON university_moderators FOR SELECT
  USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));