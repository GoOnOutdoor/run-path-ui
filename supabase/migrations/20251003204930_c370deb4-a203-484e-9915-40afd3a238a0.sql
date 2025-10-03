-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  objective TEXT,
  event_name TEXT,
  event_date DATE,
  distance TEXT,
  weekly_frequency INTEGER,
  available_days TEXT[],
  birth_date DATE,
  observations TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for students table
CREATE POLICY "Users can view their own student profile"
ON public.students
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own student profile"
ON public.students
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own student profile"
ON public.students
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own student profile"
ON public.students
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();