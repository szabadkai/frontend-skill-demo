-- Drop existing tables and functions
DROP TABLE IF EXISTS public.goals CASCADE;
DROP TABLE IF EXISTS public.todos CASCADE;
DROP TABLE IF EXISTS public.list_members CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_list CASCADE;
DROP FUNCTION IF EXISTS public.share_list_with_email CASCADE;

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- Create lists table
CREATE TABLE public.lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create list_members table
CREATE TABLE public.list_members (
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'member'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (list_id, user_id)
);

-- Trigger to automatically add the owner to list_members
CREATE OR REPLACE FUNCTION public.handle_new_list() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.list_members (list_id, user_id, role)
  VALUES (new.id, new.owner_id, 'owner');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_list_created
  AFTER INSERT ON public.lists
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_list();

-- Lists & List Members RLS
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their lists." ON public.lists FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.lists.id AND user_id = auth.uid()));
CREATE POLICY "Users can insert lists." ON public.lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update their lists if owner." ON public.lists FOR UPDATE 
  USING (owner_id = auth.uid());
CREATE POLICY "Users can delete their lists if owner." ON public.lists FOR DELETE 
  USING (owner_id = auth.uid());

ALTER TABLE public.list_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own membership." ON public.list_members FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Owners can add members." ON public.list_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND owner_id = auth.uid()));
CREATE POLICY "Owners can remove members." ON public.list_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.lists WHERE id = list_id AND owner_id = auth.uid()));


-- Create todos table
CREATE TABLE public.todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  linked_goals TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Todos RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view todos in their lists." ON public.todos FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.todos.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert todos in their lists." ON public.todos FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.todos.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update todos in their lists." ON public.todos FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.todos.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete todos in their lists." ON public.todos FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.todos.list_id AND user_id = auth.uid()));


-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  progress FLOAT DEFAULT 0,
  inferred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals RLS
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view goals in their lists." ON public.goals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.goals.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can insert goals in their lists." ON public.goals FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.goals.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can update goals in their lists." ON public.goals FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.goals.list_id AND user_id = auth.uid()));
CREATE POLICY "Users can delete goals in their lists." ON public.goals FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.list_members WHERE list_id = public.goals.list_id AND user_id = auth.uid()));

-- Set up realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lists, public.list_members, public.todos, public.goals;

-- Secure Sharing RPC
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

  -- 2. Find the user ID by email
  SELECT id INTO found_user_id
  FROM public.profiles
  WHERE email = target_email
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
