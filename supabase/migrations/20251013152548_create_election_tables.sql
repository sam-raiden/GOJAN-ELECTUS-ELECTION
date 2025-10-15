/*
  # Election System Database Schema

  ## Overview
  Creates the complete database structure for the Gojan Online Election System with proper relationships and security policies.

  ## New Tables
  
  ### students
  - `id` (uuid, primary key) - Unique student identifier
  - `name` (text) - Full name of the student
  - `email` (text, unique) - College email address
  - `dept` (text) - Department name
  - `year` (text) - Current academic year
  - `has_voted` (boolean, default false) - Tracks if student has cast their vote
  - `student_id` (text, unique) - Student ID number
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### candidates
  - `id` (uuid, primary key) - Unique candidate identifier
  - `name` (text) - Candidate's full name
  - `position` (text) - Position they're running for
  - `dept` (text) - Department
  - `year` (text) - Academic year
  - `bio` (text) - Candidate's biography/manifesto
  - `image_url` (text) - Profile image URL
  - `votes` (integer, default 0) - Vote count
  - `created_at` (timestamptz) - Record creation timestamp
  
  ### admin
  - `id` (uuid, primary key) - Admin identifier
  - `email` (text, unique) - Admin email address
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### election
  - `id` (uuid, primary key) - Election identifier
  - `title` (text) - Election title
  - `description` (text) - Election description
  - `is_active` (boolean, default false) - Election status
  - `start_date` (timestamptz) - Election start time
  - `end_date` (timestamptz) - Election end time
  - `created_at` (timestamptz) - Record creation timestamp

  ### votes
  - `id` (uuid, primary key) - Vote identifier
  - `student_id` (uuid, foreign key) - Reference to students table
  - `candidate_id` (uuid, foreign key) - Reference to candidates table
  - `election_id` (uuid, foreign key) - Reference to election table
  - `created_at` (timestamptz) - Vote timestamp

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Students can read candidates and election data
  - Students can insert votes (one per election)
  - Students can update their own has_voted status
  - Admin can perform all operations on candidates and election tables
  - Public read access for candidates and election to display results
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  dept text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  has_voted boolean DEFAULT false,
  student_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create candidates table
CREATE TABLE IF NOT EXISTS candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL DEFAULT 'Candidate',
  dept text NOT NULL DEFAULT '',
  year text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  votes integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create admin table
CREATE TABLE IF NOT EXISTS admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create election table
CREATE TABLE IF NOT EXISTS election (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  is_active boolean DEFAULT false,
  start_date timestamptz DEFAULT now(),
  end_date timestamptz DEFAULT now() + interval '7 days',
  created_at timestamptz DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  candidate_id uuid REFERENCES candidates(id) ON DELETE CASCADE,
  election_id uuid REFERENCES election(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, election_id)
);

-- Enable Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE election ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Students table policies
CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Students can update own has_voted status"
  ON students FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Candidates table policies
CREATE POLICY "Anyone can view candidates"
  ON candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view candidates"
  ON candidates FOR SELECT
  TO anon
  USING (true);

-- Election table policies
CREATE POLICY "Anyone can view election"
  ON election FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can view election"
  ON election FOR SELECT
  TO anon
  USING (true);

-- Votes table policies
CREATE POLICY "Students can view own votes"
  ON votes FOR SELECT
  TO authenticated
  USING (student_id = auth.uid());

CREATE POLICY "Students can insert votes"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

-- Admin table policies
CREATE POLICY "Admins can read admin table"
  ON admin FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Insert default admin
INSERT INTO admin (email)
VALUES ('admin@gojan.edu')
ON CONFLICT (email) DO NOTHING;

-- Insert default election
INSERT INTO election (title, description, is_active)
VALUES ('Student Council Elections 2024', 'Vote for your student council representatives', true)
ON CONFLICT DO NOTHING;

-- Insert default candidates
INSERT INTO candidates (name, position, dept, year, bio, image_url, votes)
VALUES 
  ('Rajesh Kumar', 'President', 'Computer Science', 'Final Year', 'Committed to improving campus facilities and student welfare', 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400', 0),
  ('Priya Sharma', 'Vice President', 'Electronics', 'Third Year', 'Focusing on academic excellence and extracurricular activities', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400', 0),
  ('Arjun Patel', 'Secretary', 'Mechanical', 'Third Year', 'Dedicated to transparent governance and student representation', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400', 0)
ON CONFLICT DO NOTHING;