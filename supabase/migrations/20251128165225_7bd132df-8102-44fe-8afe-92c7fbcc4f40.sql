-- Profiles tablosuna herkesin kullanıcı adlarını görebilmesi için policy ekle
-- (Bu moderatör listesi ve diğer yerlerde kullanıcı adlarının görünmesi için gerekli)

CREATE POLICY "Anyone can view usernames"
ON profiles
FOR SELECT
USING (true);