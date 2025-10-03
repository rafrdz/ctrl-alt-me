CREATE TYPE job_status AS ENUM (
  'applied',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
  'ghosted',
  'accepted'
);

CREATE TABLE IF NOT EXISTS job_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  link TEXT DEFAULT ''::text NOT NULL,
  status job_status NOT NULL,
  notes TEXT DEFAULT ''::text NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);
