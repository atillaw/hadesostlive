-- Remove any university_mod role assignments
DELETE FROM user_roles WHERE role = 'university_mod';

-- We cannot remove the enum value easily because it's used in policies
-- Instead, we'll just leave it in the enum but ensure no one uses it
-- This is the safest approach without dropping and recreating all policies

-- Add a comment to document this
COMMENT ON TYPE app_role IS 'Available roles: admin, editor, developer, super_admin, global_mod, forum_mod. Note: university_mod is deprecated and should not be used.';