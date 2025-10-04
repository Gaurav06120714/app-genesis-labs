-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student', 'parent');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Create institutions table
CREATE TABLE public.institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create classes table
CREATE TABLE public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  schedule_time TIME,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create students table
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID REFERENCES public.institutions(id) ON DELETE CASCADE NOT NULL,
  student_id_number TEXT NOT NULL,
  device_mac_id TEXT,
  facial_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(institution_id, student_id_number)
);

-- Create class_enrollments table
CREATE TABLE public.class_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

-- Create attendance_sessions table
CREATE TABLE public.attendance_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID REFERENCES public.classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  qr_code_data TEXT NOT NULL,
  qr_expires_at TIMESTAMPTZ NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create attendance_records table
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.attendance_sessions(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'pending')),
  verification_method TEXT CHECK (verification_method IN ('qr_scan', 'manual', 'facial_recognition')),
  marked_at TIMESTAMPTZ,
  device_verified BOOLEAN DEFAULT FALSE,
  wifi_verified BOOLEAN DEFAULT FALSE,
  face_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

-- Create parent_student_links table
CREATE TABLE public.parent_student_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(parent_id, student_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- User roles RLS policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- Institutions RLS policies (public read, admin write)
CREATE POLICY "Anyone can view institutions" ON public.institutions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage institutions" ON public.institutions
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Classes RLS policies
CREATE POLICY "Students can view enrolled classes" ON public.classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.students s ON ce.student_id = s.id
      WHERE ce.class_id = classes.id
      AND s.profile_id = auth.uid()
    )
    OR teacher_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers can manage own classes" ON public.classes
  FOR ALL USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Students RLS policies
CREATE POLICY "Users can view own student record" ON public.students
  FOR SELECT USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'teacher'));

-- Attendance sessions RLS policies
CREATE POLICY "Students can view sessions for enrolled classes" ON public.attendance_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.class_enrollments ce
      JOIN public.students s ON ce.student_id = s.id
      WHERE ce.class_id = attendance_sessions.class_id
      AND s.profile_id = auth.uid()
    )
    OR teacher_id = auth.uid()
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Teachers can manage sessions for own classes" ON public.attendance_sessions
  FOR ALL USING (teacher_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Attendance records RLS policies
CREATE POLICY "Students can view own attendance" ON public.attendance_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = attendance_records.student_id
      AND s.profile_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'teacher')
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Students can mark own attendance" ON public.attendance_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id
      AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "Teachers can manage attendance" ON public.attendance_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attendance_sessions sess
      WHERE sess.id = session_id
      AND sess.teacher_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Parent-student links RLS policies
CREATE POLICY "Parents can view linked students" ON public.parent_student_links
  FOR SELECT USING (parent_id = auth.uid());

-- Class enrollments RLS policies
CREATE POLICY "Users can view relevant enrollments" ON public.class_enrollments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = class_enrollments.student_id
      AND s.profile_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.classes c
      WHERE c.id = class_enrollments.class_id
      AND c.teacher_id = auth.uid()
    )
    OR public.has_role(auth.uid(), 'admin')
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add updated_at trigger to profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();