-- First clean up orphaned user_roles
DELETE FROM user_roles 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Update RLS policy for user_roles to allow admins to delete
DROP POLICY IF EXISTS "Admins can delete roles" ON user_roles;
CREATE POLICY "Admins can delete roles" ON user_roles
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policy for user_roles to allow admins to manage roles
DROP POLICY IF EXISTS "Admins can insert roles" ON user_roles;
CREATE POLICY "Admins can insert roles" ON user_roles
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update RLS policy for profiles to allow admins to delete
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles" ON profiles
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));