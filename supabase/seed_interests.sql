-- Seeds the `interests` table used by onboarding and the match algorithm.
-- Safe to run more than once (existing rows are left untouched).
insert into interests (name, slug) values
  ('Computer Science', 'computer-science'),
  ('Artificial Intelligence', 'artificial-intelligence'),
  ('Engineering', 'engineering'),
  ('Medicine', 'medicine'),
  ('Biology', 'biology'),
  ('Business', 'business'),
  ('Finance', 'finance'),
  ('Economics', 'economics'),
  ('Law', 'law'),
  ('Government', 'government'),
  ('Environmental Science', 'environmental-science'),
  ('Journalism', 'journalism'),
  ('Writing', 'writing'),
  ('Art', 'art'),
  ('Music', 'music'),
  ('Film', 'film'),
  ('Mathematics', 'mathematics'),
  ('Physics', 'physics'),
  ('Chemistry', 'chemistry'),
  ('Social Sciences', 'social-sciences')
on conflict (name) do nothing;
