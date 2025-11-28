-- Forum moderatörlerinin de moderatör listesini görebilmesi için policy güncelleme

-- Mevcut policy'leri kaldır
DROP POLICY IF EXISTS "Moderators can view their assignments" ON community_moderators;
DROP POLICY IF EXISTS "Moderators can view themselves" ON community_moderators;

-- Yeni policy ekle - forum_mod da görebilsin
CREATE POLICY "Moderators and forum mods can view moderators"
ON community_moderators
FOR SELECT
USING (
  (auth.uid() = user_id) 
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'forum_mod'::app_role)
);