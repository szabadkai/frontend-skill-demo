-- Fix case insensitivity for sharing list
CREATE OR REPLACE FUNCTION public.share_list_with_email(target_list_id UUID, target_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  found_user_id UUID;
  is_owner BOOLEAN;
BEGIN
  -- 1. Check if the executor is the owner of the list
  SELECT EXISTS (
    SELECT 1 FROM public.lists
    WHERE id = target_list_id AND owner_id = auth.uid()
  ) INTO is_owner;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Only the list owner can share this list.';
  END IF;

  -- 2. Find the user ID by email (case-insensitive)
  SELECT id INTO found_user_id
  FROM public.profiles
  WHERE lower(email) = lower(target_email)
  LIMIT 1;

  IF found_user_id IS NULL THEN
    RAISE EXCEPTION 'User with this email not found.';
  END IF;

  -- 3. Insert into list_members
  INSERT INTO public.list_members (list_id, user_id, role)
  VALUES (target_list_id, found_user_id, 'member')
  ON CONFLICT (list_id, user_id) DO NOTHING;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
