-- Forum moderators de raporları görebilsin
DROP POLICY IF EXISTS "Mods can view reports" ON reports;

CREATE POLICY "Mods can view reports"
ON reports
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'global_mod'::app_role)
  OR has_role(auth.uid(), 'forum_mod'::app_role)
);

DROP POLICY IF EXISTS "Mods can update reports" ON reports;

CREATE POLICY "Mods can update reports"
ON reports
FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'global_mod'::app_role)
  OR has_role(auth.uid(), 'forum_mod'::app_role)
);